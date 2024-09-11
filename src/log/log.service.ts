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

  async save(ip:string, attackType:string, isAttack:number, serialNo:string) {
    const isDevice = await this.deviceInfoRepository.findOneBy({serialNo})
    var result;
    if(isDevice) {
      try {
        this.logRepository.insert({
          ip,
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
          const date = row[0]+' '+row[1]//log_output.csv
          const ip = row[2]
          const serialNo = row[3]
          const isAttack = row[4] == "Normal" ? 0 : 1
          const attackType = row[5]
          const device = await this.deviceInfoRepository.findOneBy({ serialNo })

          // 할당된 값을 데이터베이스에 저장
          const entity = new Log();
          entity.createdAt = moment(date).toDate();
          entity.attackType = attackType
          entity.isAttack = isAttack
          entity.ip = ip
          entity.device = device;
          this.logRepository.save(entity);

          // 각 행이 처리될 때마다 클라이언트에 데이터를 실시간 전송
          if(isAttack == 1 && flag != attackType || flag == 0) {
            flag = attackType;//attackType 값 할당
            client.emit('%isAttacked', { 
              attack:true,
              type:attackType,
              device:device.serialNo,
              attackedTime:moment(date).format('YYYY-MM-DD hh:mm:ss')
            });
          }
        })
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
    const { ip, attackType, isAttack, serialNo } = req.body;
    const isDevice = await this.deviceInfoRepository.findOneBy({serialNo})
    if(isDevice) {
      try {
        this.logRepository.insert({
          ip,
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