import { Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
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
import PreStreamDto from '@domain/pre.stream.dto';

@WebSocketGateway(3001, { cors: { origin: 'http://localhost:3000', credentials: true } })
class StreamGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  private readonly server: Server;

  constructor(@Inject('STREAM_SERVICE') private redisClient: ClientProxy) {}

  private uuid = () => {
    const tokens = v4().split('-');
    return tokens[2] + tokens[1] + tokens[0] + tokens[3] + tokens[4];
  };

  async handleConnection(client: ClientSocket) {
    client.sessionId = this.uuid();
    client.join(client.sessionId);
    client.emit('server:preprocess:connection', client.sessionId);
  }

  async handleDisconnect(client: ClientSocket) {
    client.rooms.clear();
    client.disconnect();
  }

  @SubscribeMessage('client:preprocess:stream')
  receiveStream(@ConnectedSocket() client: ClientSocket, @MessageBody('frame') frame: Buffer) {
    this.redisClient.emit('STREAM_PREPROCESS', PreStreamDto.fromData(client.sessionId, frame));
  }
}

export default StreamGateway;
