import { Controller, Post, Req, Res } from "@nestjs/common";
import { UserService } from "./user.service";
import { Request, Response } from "express";

@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}
  
  @Post()
  async CreateUser(@Req() req:Request, @Res() res:Response) {
    return await this.userService.createUser(req, res);
  }
}