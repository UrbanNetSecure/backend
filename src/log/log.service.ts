import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Log } from "src/entity/Log.entity";
import { Request, Response } from "express";
import { Between, Repository } from "typeorm";
import { DeviceInfo } from "src/entity/DeviceInfo.entity";
import * as fs from 'fs';
import * as csv from 'csv-parser';
import * as moment from 'moment';
import { Socket } from "socket.io";
import { join } from 'path';

var flag = 0; //csv파일 불러올때 사용

@Injectable()
export class LogService {
  constructor(
    @InjectRepository(Log)
    private readonly logRepository: Repository<Log>,
    @InjectRepository(DeviceInfo)
    private readonly deviceInfoRepository: Repository<DeviceInfo>
  ) {}
  
  async getAll(res:Response) {
    var data;
    try {
      data = await this.logRepository.find();
    } catch(err) {
      return res.status(500).send({
        status:0,
        msg:'값을 조회하는 도중 알 수 없는 에러가 발생했습니다.'
      })
    }   
    return res.status(200).send({
      status:1,
      msg:'성공적으로 조회했습니다.',
      data
    })
  }

  async save(content:string, attackType:string, isAttack:number, serialNo:string) {
    const isDevice = await this.deviceInfoRepository.findOneBy({serialNo})
    var result;
    if(isDevice) {
      try {
        this.logRepository.insert({
          content,
          attackType,
          isAttack,
          device:isDevice
        })
      } catch(err) {
        result = ({
          success:-1
        })
      }
      result = ({
        success:1
      })
    } else {
      result = ({
        success:0
      })
    }
    return result;
  }

  async processCsvFile(fileName: string, client: Socket) {
    // 업로드된 CSV 파일 경로 설정
    const filePath = join(process.cwd(), 'uploads', fileName);

    return new Promise<void>((resolve, reject) => {
      // CSV 파일을 읽기 시작
      fs.createReadStream(filePath)
        .pipe(csv({ headers:false}))
        .on('data', async (row) => {
          // CSV 파일의 각 행 데이터를 변수에 할당
          const column1 = row[1];  // content
          const column2 = row[2];  // attackType
          const column3 = row[3];  // isAttack
          const column4 = row[4]; //createdAt
          const deviceid = row[5]; // deviceId

          const device = await this.deviceInfoRepository.findOneBy({ id:deviceid })

          // 할당된 값을 데이터베이스에 저장
          const entity = new Log();
          entity.content = column1;
          entity.attackType = column2;
          entity.isAttack = column3;
          entity.createdAt = column4;
          entity.device = device;
          this.logRepository.save(entity);

          // 각 행이 처리될 때마다 클라이언트에 데이터를 실시간 전송
          if(column3 == 1 && flag != column2 || flag == 0) {
            flag = column2;//attackType 값 할당
            console.log({ 
              attack:true,
              type:column2,
              device:device.serialNo,
              attackedTime:moment(column4).format('YYYY-MM-DD hh:mm:ss')
            })
            client.emit('%isAttacked', { 
              attack:true,
              type:column2,
              device:device.serialNo,
              attackedTime:moment(column4).format('YYYY-MM-DD hh:mm:ss')
            });
          }
        })
        // .on('end', () => {
        //   // 모든 CSV 파일 처리 완료 후 클라이언트에 완료 메시지 전송
        //   client.emit('csvProcessingComplete', 'All rows have been processed.');
        //   resolve();
        // })
        .on('error', (error) => {
          // 에러 발생 시 클라이언트에 에러 메시지 전송
          client.emit('%isAttacked', 'Error processing CSV file');
          reject(error);
        });
    });
  }

  async getAllByIdInWeek(serialNo:string, today:Date, weeksAgo:Date) {
    try {
      const device = await this.deviceInfoRepository.findOneBy({ serialNo });
      const log = await this.logRepository.find({
        where:{
          device,
          createdAt:Between(
            weeksAgo,
            today
          )
        }
      },
    );
      return {
        data:log
      }
    } catch(err) {
      return {
        msg:'로그 조회중 알 수 없는 에러가 발생했습니다.',
        status:-1
      }
    }
  }

  async getLogByDeviceId(id:number, res:Response) {
    try {
      const device = await this.deviceInfoRepository.findOneBy({ id });
      if(!device) {
        return res.status(400).send({
          success:0,
          msg:'해당하는 id를 가진 기기정보를 찾을 수 없습니다.'
        })
      }
      const data = await this.logRepository.findBy({ device });
      return res.status(200).send({
        success:1,
        msg:'로그를 성공적으로 조회했습니다.',
        data
      })
    } catch(err) {
      return res.status(500).send({
        success:0,
        msg:'로그 조회중 알 수 없는 에러가 발생했습니다.'
      })
    }
  }

  async getLogByTime(req:Request, res:Response) {
    const { startTime, endTime } = req.body;
    try {
      const data = await this.logRepository.find({
        where:{
          createdAt: Between(
            startTime,
            endTime
          )
        }
      })
      return res.status(200).send({
        success:1,
        msg:'로그를 성공적으로 조회했습니다.',
        data
      })
    } catch(err) {
      return res.status(500).send({
        success:0,
        msg:'로그 조회중 알 수 없는 에러가 발생했습니다.'
      })
    }
  }

  async getLogByType(req:Request, res:Response) {
    const { attackType } = req.body;
    if(attackType == undefined) {
      return res.status(400).send({
        success:0,
        msg:'공격 유형을 입력해야합니다.',
      })
    }
    try {
      const data = await this.logRepository.find({
        where:{
          attackType
        }
      })
      return res.status(200).send({
        success:1,
        msg:'로그를 성공적으로 조회했습니다.',
        data
      })
    } catch(err) {
      return res.status(500).send({
        success:0,
        msg:'로그 조회중 알 수 없는 에러가 발생했습니다.'
      })
    }
  }

//=============develop(web)================
  async saveDev(req:Request, res:Response) {
    const { content, attackType, isAttack, serialNo } = req.body;
    const isDevice = await this.deviceInfoRepository.findOneBy({serialNo})
    if(isDevice) {
      try {
        this.logRepository.insert({
          content,
          attackType,
          isAttack,
          device:isDevice
        })
      } catch(err) {
        return res.status(500).send({
          success:0,
          msg:'로그 저장중 알 수 없는 에러가 발생했습니다.'
        })
      }
      return res.status(200).send({
        success:1,
        msg:'성공적으로 로그를 저장했습니다.'
      })
    } else {
      return res.status(400).send({
        success:0,
        msg:'해당하는 시리얼 번호를 가진 기기가 없습니다.'
      })
    }
  }
}