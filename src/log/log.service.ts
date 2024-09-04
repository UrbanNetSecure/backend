import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Log } from "src/entity/Log.entity";
import { Request, Response } from "express";
import { Repository } from "typeorm";

@Injectable()
export class LogService {
  constructor(
    @InjectRepository(Log)
    private logRepository: Repository<Log>
  ) {}
  
  async getAll(res:Response) {
    var data;
    try {
      data = await this.logRepository.find();
    } catch(err) {
      return res.status(500).send({
        status:0,
        msg:'값을 조회하는 도중 알 수 없는 에러가 발생했습니다.'
      })
    }
    return res.status(200).send({
      status:1,
      msg:'성공적으로 조회했습니다.',
      data
    })
  }

  async save(req:Request, res:Response) {
    const {} = req.body;
  }
}