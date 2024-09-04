import { Column, ManyToOne,CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";
import { DeviceInfo } from "./DeviceInfo.entity";

@Entity("log", { schema:"typeoorm"})
export class Log {
  @PrimaryGeneratedColumn({type:'int'})
  id:number;
  
  @Column({type:'text', name:'content'})
  content:string;

  @Column({type:'tinyint', name:'type'})
  atteckType:number;

  @Column({type:'tinyint', name:'status'})
  isAttack:number;

  @ManyToOne(() => DeviceInfo, (device) => device.serialNo)
  deviceId:DeviceInfo;

  @CreateDateColumn({type:'timestamp'})
  createdAt:Date;
}