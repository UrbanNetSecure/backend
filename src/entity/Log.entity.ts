import { Column, ManyToOne,CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";
import { DeviceInfo } from "./DeviceInfo.entity";

@Entity("log", { schema:"typeoorm"})
export class Log {
  @PrimaryGeneratedColumn({type:'int'})
  id:number;
  
  @Column({type:'varchar', name:'ip'})
  ip:string;

  @Column({type:'varchar', name:'type', length:20, default:null})
  attackType:string;

  @Column({type:'tinyint', name:'status'})
  isAttack:number;
  

  @ManyToOne(() => DeviceInfo, (device) => device.serialNo)
  device:DeviceInfo;

  @CreateDateColumn({type:'timestamp'})
  createdAt:Date;
}