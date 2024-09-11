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
  transports:['websocket'],
  cors:{origin:"*"}
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
    this.logService.processCsvFile('log_output.csv', client)
  }

  @SubscribeMessage('$logData')
  async getAllById(@MessageBody() req:{serialNo:any}) {
    const today = moment().toDate();
    const weeksAgo = moment().subtract(7,'d').hour(0).minute(0).seconds(0).millisecond(0).toDate();
    const result = await this.logService.getAllByIdInWeek(req.serialNo, today, weeksAgo);
    var donut = {};
    var graph = [];
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

    //gpt code===============
    let attackCnt = 0;
    let nonAttackCnt = 0;
    let currentDayStart = moment(result.data[0].createdAt).startOf('day'); // 첫 번째 데이터의 날짜 시작

    result.data.forEach((el) => {
      const createdAt = moment(el.createdAt);
      const status = el.isAttack;

      // 새로운 날짜로 넘어가면 현재 날짜의 데이터를 저장하고 다음 날짜로 이동
      if (createdAt.isAfter(currentDayStart.clone().endOf('day'))) {
        graph.push({
          dayStart: currentDayStart.format('YYYY-MM-DD'),
          attackCnt,
          nonAttackCnt,
        });

        // 새로운 날짜로 초기화
        attackCnt = 0;
        nonAttackCnt = 0;
        currentDayStart = createdAt.startOf('day');
      }

      // 로그 집계
      if (status == 1) {
        attackCnt++;
      } else {
        nonAttackCnt++;
      }
    });

    // 마지막 날짜의 데이터 추가
    graph.push({
      dayStart: currentDayStart.format('YYYY-MM-DD'),
      attackCnt,
      nonAttackCnt,
    });
    //gpt code end==================
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
      graph,
      total:result.data.length
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