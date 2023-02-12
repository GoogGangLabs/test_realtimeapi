import { Socket } from 'socket.io';

class ClientSocket extends Socket {
  sessionId: string;
  sequence: number;
}

export default ClientSocket;
