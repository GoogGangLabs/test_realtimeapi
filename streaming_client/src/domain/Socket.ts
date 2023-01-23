import * as io from "socket.io-client";
import {
  EventNames,
  EventParams,
  EventsMap,
  ReservedOrUserListener,
  ReservedOrUserEventNames,
} from "@socket.io/component-emitter";

class Socket<ListenEvents extends EventsMap, EmitEvents extends EventsMap, ReservedEvents extends EventsMap = {}> {
  private socket?: io.Socket;

  private host: string;
  private path: string;

  constructor(category: string) {
    const port = category === "preprocess" ? 4000 : 5000;

    this.host = process.env.NODE_ENV === "development" ? `http://localhost:${port}` : "https://goodganglabs.xyz";
    this.path = process.env.NODE_ENV === "development" ? "/socket.io" : `/${category}`;
  }

  public connect(sessionId?: string): void {
    this.socket = io.connect(this.host, { path: this.path, extraHeaders: { sessionId: sessionId || "" } });
  }

  public disconnect(): void {
    this.socket?.disconnect();
  }

  public on<Ev extends ReservedOrUserEventNames<ReservedEvents, ListenEvents>>(
    ev: string,
    listener: ReservedOrUserListener<ReservedEvents, ListenEvents, Ev>
  ): void {
    this.socket?.on(ev, listener);
  }

  public emit<Ev extends EventNames<EmitEvents>>(ev: string, ...args: EventParams<EmitEvents, Ev>): void {
    this.socket?.emit(ev, ...args);
  }

  public reRender(): void {
    this.socket?.removeAllListeners();
  }

  public isConnected(): boolean {
    return this.socket !== undefined;
  }
}

export default Socket;
