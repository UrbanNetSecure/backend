import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { LogController } from "./log.controller";
import { LogService } from "./log.service";
import { Log } from "src/entity/Log.entity";
import { DeviceInfo } from "src/entity/DeviceInfo.entity";

@Module({
  imports:[TypeOrmModule.forFeature([Log, DeviceInfo])],
  exports:[TypeOrmModule],
  controllers:[LogController],
  providers:[LogService]
})
export class LogModule {}