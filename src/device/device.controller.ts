import { Controller, Get, Param, Post, Req, Res } from "@nestjs/common";
import { Request, Response } from "express";
import { DeviceInfoService } from "./device.service";

@Controller('/v1/device')
export class DeviceInfoController {
  constructor(private readonly deviceInfoService: DeviceInfoService) {}
  
  @Post('/register')
  async registerDevice(@Req() req:Request, @Res() res:Response) {
    return await this.deviceInfoService.registerDevice(req, res);
  }

  @Post('/delete')
  async deleteDevice(@Req() req:Request, @Res() res:Response) {
    return await this.deviceInfoService.deleteDevice(req, res);
  }

  @Post('/update')
  async updateDevice(@Req() req:Request, @Res() res:Response) {
    return await this.deviceInfoService.updateDevice(req, res);
  }

  @Get(':id')
  async findDeivceById(@Param('id') id:number, @Res() res) {
    return await this.deviceInfoService.findDeviceById(id, res);
  }

  @Get()
  async getAllDevice(@Res() res:Response) {
    return await this.deviceInfoService.getAll(res);
  }
}