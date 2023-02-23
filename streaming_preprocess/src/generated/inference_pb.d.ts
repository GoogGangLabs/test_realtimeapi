// package: inference
// file: inference.proto

import * as jspb from "google-protobuf";

export class StreamRequest extends jspb.Message {
  getSessionid(): string;
  setSessionid(value: string): void;

  getSequence(): number;
  setSequence(value: number): void;

  getStartedat(): number;
  setStartedat(value: number): void;

  getFrame(): Uint8Array | string;
  getFrame_asU8(): Uint8Array;
  getFrame_asB64(): string;
  setFrame(value: Uint8Array | string): void;

  clearTimestampList(): void;
  getTimestampList(): Array<number>;
  setTimestampList(value: Array<number>): void;
  addTimestamp(value: number, index?: number): number;

  clearStepList(): void;
  getStepList(): Array<number>;
  setStepList(value: Array<number>): void;
  addStep(value: number, index?: number): number;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): StreamRequest.AsObject;
  static toObject(includeInstance: boolean, msg: StreamRequest): StreamRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: StreamRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): StreamRequest;
  static deserializeBinaryFromReader(message: StreamRequest, reader: jspb.BinaryReader): StreamRequest;
}

export namespace StreamRequest {
  export type AsObject = {
    sessionid: string,
    sequence: number,
    startedat: number,
    frame: Uint8Array | string,
    timestampList: Array<number>,
    stepList: Array<number>,
  }
}

export class InferenceResponse extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): InferenceResponse.AsObject;
  static toObject(includeInstance: boolean, msg: InferenceResponse): InferenceResponse.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: InferenceResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): InferenceResponse;
  static deserializeBinaryFromReader(message: InferenceResponse, reader: jspb.BinaryReader): InferenceResponse;
}

export namespace InferenceResponse {
  export type AsObject = {
  }
}

export class HelloRequest extends jspb.Message {
  getName(): string;
  setName(value: string): void;

  getNum(): number;
  setNum(value: number): void;

  getHasBoolean(): boolean;
  setHasBoolean(value: boolean): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): HelloRequest.AsObject;
  static toObject(includeInstance: boolean, msg: HelloRequest): HelloRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: HelloRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): HelloRequest;
  static deserializeBinaryFromReader(message: HelloRequest, reader: jspb.BinaryReader): HelloRequest;
}

export namespace HelloRequest {
  export type AsObject = {
    name: string,
    num: number,
    hasBoolean: boolean,
  }
}

export class HelloReply extends jspb.Message {
  getMessage(): string;
  setMessage(value: string): void;

  getId(): number;
  setId(value: number): void;

  getHasBoolean(): boolean;
  setHasBoolean(value: boolean): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): HelloReply.AsObject;
  static toObject(includeInstance: boolean, msg: HelloReply): HelloReply.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: HelloReply, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): HelloReply;
  static deserializeBinaryFromReader(message: HelloReply, reader: jspb.BinaryReader): HelloReply;
}

export namespace HelloReply {
  export type AsObject = {
    message: string,
    id: number,
    hasBoolean: boolean,
  }
}

