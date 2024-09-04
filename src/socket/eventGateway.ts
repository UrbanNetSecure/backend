import { Logger } from '@nestjs/common';
import {
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
  OnGatewayInit
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
@WebSocketGateway(4000, {
  namespace:"/api/control",
  cors:{origin:"*"}
})
//port: 4000, /api/control로 이벤트 보내야함
export class EventGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private logger: Logger = new Logger("EventsGateway");

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