import { Controller, Get, Param, Post, Req, Res } from "@nestjs/common";
import { Request, Response } from "express";
import { LogService } from "./log.service";

@Controller('/v1/logs')
export class LogController {
  constructor(private readonly logService: LogService) {}
  
  // @Post('/save')
  // async logSave(@Req() req:Request, @Res() res:Response) {
  //   return await this.logService.saveDev(req, res);
  // }

  @Get()
  async getAll(@Res() res:Response) {
    return await this.logService.getAll(res);
  }

  @Get('/:id')
  async getLogById(@Param('id') id:number, @Res() res:Response) {
    return await this.logService.getLogByDeviceId(id, res);
  }

  @Post('/time')
  async getLogByTime(@Req() req:Request, @Res() res:Response) {
    return await this.logService.getLogByTime(req, res);
  }

  @Post('/type')
  async getLogByType(@Req() req:Request, @Res() res:Response) {
    return await this.logService.getLogByType(req, res);
  }
}