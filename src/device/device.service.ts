import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DeviceInfo } from "src/entity/DeviceInfo.entity";
import { Request, Response } from 'express';
import { Repository } from "typeorm";

@Injectable()
export class DeviceInfoService {
  constructor(
    @InjectRepository(DeviceInfo)
    private deviceInfoRepository: Repository<DeviceInfo>
  ) {}

  async registerDevice(req:Request, res:Response) {
    const { name, x, y, serialNo } = req.body;
    
    const isDevice = await this.deviceInfoRepository.findOneBy({ serialNo });
    
    if(!isDevice) {
      try {
        await this.deviceInfoRepository.insert({
          name,
          serialNo,
          x,
          y,
        })
      } catch(err) {
        return res.status(500).send({
          success:0,
          msg:'기기 정보 등록중 알 수 없는 오류가 발생했습니다.'
        })
      }
    } else {
      return res.status(400).send({
        success:0,
        msg:'이미 등록된 시리얼번호입니다.'
      })
    }
    return res.status(201).send({
      success:1,
      msg:'기기 정보를 성공적으로 등록했습니다.'
    })
  }

  async deleteDevice(req:Request, res:Response) {
    const { serialNo } = req.body;

    const isDevice = await this.deviceInfoRepository.findOneBy({ serialNo });  
    if(isDevice) {
      try {
        this.deviceInfoRepository.delete({ serialNo });
      } catch(err) {
        return res.status(500).send({
          success:0,
          msg:'기기 정보 삭제중 알 수 없는 오류가 발생했습니다.'
        })
      }
      
      return res.status(201).send({
        success:1,
        msg:'기기 정보를 성공적으로 삭제했습니다.'
      })
    } else {
      return res.status(400).send({
        success:0,
        msg:'해당하는 시리얼번호를 가진 기기를 찾을 수 없습니다.'
      })
    }
  }
 
  async findDeviceById(id:number, res:Response) {
    try {
      const isDevice = await this.deviceInfoRepository.findOneBy({id});
      if(isDevice) {
        return res.status(200).send({
          success:1,
          msg:'성공적으로 기기 정보를 조회했습니다.',
          data:isDevice
        })
      } else {
        return res.status(400).send({
          success:0,
          msg:'해당하는 id를 가진 기기가 없습니다.'
        })
      }
    } catch(err) {
      return res.status(500).send({
        success:0,
        msg:'기기 정보 조회중 알 수 없는 오류가 발생했습니다.'
      })
    }
  }

  async updateDevice(req:Request, res:Response) {
    const { serialNo, name, x, y } = req.body;
    const isDevice = await this.deviceInfoRepository.findOneBy({ serialNo });
    if(isDevice) {
      var nm, xv, yv;
      try {
        //안바뀌는 값 채워주기
        if(name === undefined) nm = isDevice.name;
        if(x === undefined) xv = isDevice.x;
        if(y === undefined) yv = isDevice.y;
        this.deviceInfoRepository.update(
          {serialNo},
          {
            name,
            x,
            y
          }  
        )
      } catch(err) {
        return res.status(500).send({
          success:0,
          msg:'기기 정보를 수정중 알 수 없는 오류가 발생했습니다.'
        })
      }
      return res.status(200).send({
        success:1,
        msg:'기기 정보를 성공적으로 수정했습니다.'
      })
    } else {
      return res.status(400).send({
        success:0,
        msg:'해당하는 시리얼번호를 가진 기기를 찾을 수 없습니다.'
      })
    }
  }

  async getAll(res:Response) {
    try {
      const data = await this.deviceInfoRepository.find();
      return res.status(200).send({
        success:1,
        msg:'성공적으로 기기 정보를 조회했습니다.',
        data
      })
    } catch(err) {
      return res.status(500).send({
        success:0,
        msg:'기기 정보 조회중 알 수 없는 오류가 발생했습니다.'
      })
    }
  }
}