import { StreamRequest } from '@grpc/inference/inference_pb';

class StreamRequestDto {
  public static fromData(sessionId: string, sequence: number, frame: Buffer, timestamp: number, inputSize: number) {
    const serverTime = Date.now();
    const streamRequest = new StreamRequest();
    streamRequest.setSessionid(sessionId);
    streamRequest.setSequence(sequence);
    streamRequest.setStartedat(timestamp);
    streamRequest.setImage(frame);
    streamRequest.setTimestampList([serverTime]);
    streamRequest.setStepList([serverTime - timestamp]);
    streamRequest.setDatasizeList([inputSize]);
    return streamRequest;
  }
}

export default StreamRequestDto;
