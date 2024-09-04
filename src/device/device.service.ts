import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DeviceInfo } from "src/entity/DeviceInfo.entity";
import { Repository } from "typeorm";

@Injectable()
export class DeviceInfoService {
  constructor(
    @InjectRepository(DeviceInfo)
    private deviceInfoRepository: Repository<DeviceInfo>
  ) {}

  
}