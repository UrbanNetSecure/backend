import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Log } from "./Log.entity";

@Entity("deviceInfo", { schema:"typeoorm"})
export class DeviceInfo {
  @PrimaryGeneratedColumn({type:'int'})
  id:number;
  
  @Column({type:'varchar', name:'name', length:50})
  name:string;

  @Column({type:'varchar', name:'serialNo', length:50, unique:true})
  serialNo:string;

  @Column({type:'varchar', name:'x', default:0})
  x:string;

  @Column({type:'varchar', name:'y', default:0})
  y:string;

  @OneToMany(() => Log, (log) => log.deviceId)
  logs: Log[];
}