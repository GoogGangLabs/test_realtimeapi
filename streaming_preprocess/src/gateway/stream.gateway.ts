import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { v4 } from 'uuid';

import ClientSocket from '@domain/client.socket';

// todo: 정렬
import { Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@WebSocketGateway(3001, { cors: { origin: 'http://localhost:3000', credentials: true } })
class StreamGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(@Inject('STREAM_PREPROCESS') private redisClient: ClientProxy) {}

  private uuid = () => {
    const tokens = v4().split('-');
    return tokens[2] + tokens[1] + tokens[0] + tokens[3] + tokens[4];
  };

  async handleConnection(client: ClientSocket) {
    client.sessionId = this.uuid();
    client.join(client.sessionId);
    console.log(client.sessionId);
    client.emit('preprocess:connection', client.sessionId);
  }

  async handleDisconnect(client: ClientSocket) {
    return;
  }

  @SubscribeMessage('test')
  test(@ConnectedSocket() client: ClientSocket, @MessageBody('data') data: any) {
    console.log(data);
    this.redisClient.emit('STREAM_PREPROCESS', [client.sessionId, data]);
  }

  @SubscribeMessage('redis')
  redis(@ConnectedSocket() client: ClientSocket, data) {
    console.log('hello');
  }
}

export default StreamGateway;
