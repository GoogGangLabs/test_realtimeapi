import { Socket } from 'socket.io';

class ClientSocket extends Socket {
  sessionId: string;
}

export default ClientSocket;
