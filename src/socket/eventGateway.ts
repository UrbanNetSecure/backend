import { Logger, Res } from '@nestjs/common';
import {
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
  OnGatewayInit,
  SubscribeMessage,
  MessageBody
} from '@nestjs/websockets';
import { Response } from 'express';
import { Server, Socket } from 'socket.io';
import { LogService } from 'src/log/log.service';
@WebSocketGateway(3001, {
  namespace:"/api/control",
  transports:['websocket']
})
//port: 3001, /api/control로 이벤트 보내야함
//$ : 서버가 듣는 이벤트
//% : 클라이언트가 받는 이벤트
export class EventGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private readonly logService:LogService
  ) {}
  @WebSocketServer() server: Server;
  private logger: Logger = new Logger("EventsGateway");

  @SubscribeMessage('$log')
  async saveLogs(@MessageBody() req:{content:string, attackType:string, isAttack:number, serialNo:string}) {
    const { content, attackType, isAttack, serialNo } = req;
    const result = await this.logService.save(content, attackType, isAttack, serialNo );
    this.server.emit('%log', result);
  }

  @SubscribeMessage('$logData')
  async getAllById(@MessageBody() req:{serialNo:any}) {
    const result = await this.logService.getAllById(req.serialNo);
    this.server.emit('%logData', result);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client Disconnected : ${client.id}`);
  }

  afterInit(server: Server) {
    this.logger.log("clear sebsocket server successed!");
  }

  handleConnection(client: Socket, ...args: any[]) {
    this.logger.log(`Client Connected : ${client.id}`);
  }
}