import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { DeviceInfo } from "src/entity/DeviceInfo.entity";
import { DeviceInfoController } from "./device.controller";
import { DeviceInfoService } from "./device.service";

@Module({
  imports:[TypeOrmModule.forFeature([DeviceInfo])],
  exports:[TypeOrmModule],
  controllers:[DeviceInfoController],
  providers:[DeviceInfoService]
})
export class DeviceInfoModule {}