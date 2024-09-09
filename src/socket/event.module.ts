import { Module } from '@nestjs/common'
import { EventGateway } from './eventGateway';
import { LogService } from 'src/log/log.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Log } from 'src/entity/Log.entity';
import { LogController } from 'src/log/log.controller';
import { DeviceInfo } from 'src/entity/DeviceInfo.entity';

@Module({
  imports:[TypeOrmModule.forFeature([Log, DeviceInfo])],
  exports:[TypeOrmModule],
  controllers: [LogController],
  providers: [EventGateway, LogService]
})
export class EventModule {}