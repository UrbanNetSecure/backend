import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entity/User.entity';
import { Log } from './entity/Log.entity';
import { DeviceInfo } from './entity/DeviceInfo.entity';
import { LogModule } from './log/log.module';
import { UserModule } from './user/user.module';
import { DeviceInfoModule } from './device/device.module';
// import { UserModule } from './user/UserModule';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: '6482',
      database: 'csc',
      entities: [User, Log, DeviceInfo],
      synchronize: true,
      autoLoadEntities: true,
    }),
    LogModule,
    // UserModule,
    DeviceInfoModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
