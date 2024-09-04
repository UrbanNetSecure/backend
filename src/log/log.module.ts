import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { LogController } from "./log.controller";
import { LogService } from "./log.service";

@Module({
  imports:[TypeOrmModule.forFeature([])],
  exports:[TypeOrmModule],
  controllers:[LogController],
  providers:[LogService]
})
export class LogModule {}