import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Log } from './entity/Log.entity';
import { DeviceInfo } from './entity/DeviceInfo.entity';
import { LogModule } from './log/log.module';
import { DeviceInfoModule } from './device/device.module';
import { EventModule } from './socket/event.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3307,
      username: 'root',
      password: 'root',
      database: 'csc',
      entities: [Log, DeviceInfo],
      synchronize: false,
      autoLoadEntities: true,
    }),
    LogModule,
    DeviceInfoModule,
    EventModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
