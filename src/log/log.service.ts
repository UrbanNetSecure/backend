import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Log } from "src/entity/Log.entity";
import { Request, Response } from "express";
import { Between, Repository } from "typeorm";
import { DeviceInfo } from "src/entity/DeviceInfo.entity";
const moment = require("moment");

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

  async getAllById(serialNo:string) {
    try {
      const device = await this.deviceInfoRepository.findOneBy({ serialNo });
      return await this.logRepository.findBy({ device });
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