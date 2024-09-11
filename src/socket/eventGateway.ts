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
import * as moment from 'moment';
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

  @SubscribeMessage('$ping')
  ping(client:Socket) {
    this.server.emit('%ping', `your SocketId is ${client.id}`)
  }

  @SubscribeMessage('$isAttacked')
  async isAttacked(client:Socket) {
    this.logService.processCsvFile('log.csv', client)
  }

  @SubscribeMessage('$logData')
  async getAllById(@MessageBody() req:{serialNo:any}) {
    const today = moment().toDate();
    const weeksAgo = moment().subtract(6,'d').hour(0).minute(0).seconds(0).millisecond(0).toDate();
    const result = await this.logService.getAllByIdInWeek(req.serialNo, today, weeksAgo);
    var donut = {};
    var graph = {};
    var frequency = {};
    var attackPercentage = 0;
    var nonAttackPercentage = 0;

    result.data.forEach((el) => {
      if(donut[el.attackType] == undefined) {
        donut[el.attackType] = {
          count:1
        }
      } else {
        donut[el.attackType].count++
      }
    })

    result.data.forEach((el) => {
      const formattedDate = moment(el.createdAt).format('YYYY-MM-DD'); // MySQL 타임스탬프를 yyyy-MM-dd로 변환
      const status = el.isAttack;
    
      // 예시: 월별로 데이터를 그룹화하기 위해 month 기준으로 배열을 만들고 데이터를 분류
      if (!graph[formattedDate]) {
        graph[formattedDate] = [];
      }
      graph[formattedDate].push({
        date: formattedDate,
        status: status,
      });
    });

    result.data.forEach((el) => {
      if(el.isAttack != 0) {
        attackPercentage++;
      } else {
        nonAttackPercentage++;
      }

      frequency = {
        attackPercentage:((attackPercentage * 100)/result.data.length),
        nonAttackPercentage:((nonAttackPercentage * 100)/result.data.length)
      }
    })

    const resData = {
      donut,
      frequency,
      graph
    }
    this.server.emit('%logData', resData);
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