import { Controller } from "@nestjs/common";
import { Request, Response } from "express";
import { DeviceInfoService } from "./device.service";

@Controller()
export class DeviceInfoController {
  constructor(private readonly deviceInfoService: DeviceInfoService) {}
  
}