import { Column, ManyToOne,CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";
import { DeviceInfo } from "./DeviceInfo.entity";

@Entity("log", { schema:"typeoorm"})
export class Log {
  @PrimaryGeneratedColumn({type:'int'})
  id:number;
  
  @Column({type:'text', name:'content'})
  content:string;

  @Column({type:'varchar', name:'type', length:15, default:null})
  attackType:string;

  @Column({type:'tinyint', name:'status'})
  isAttack:number;

  @ManyToOne(() => DeviceInfo, (device) => device.serialNo)
  device:DeviceInfo;

  @CreateDateColumn({type:'timestamp'})
  createdAt:Date;
}