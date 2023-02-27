import { InferenceResponse } from '@grpc/inference/inference_pb'
import { LandmarkResult, LandmarkVisibilityResult } from '@grpc/inference/result_pb'

interface InferenceResult {
  face: Array<LandmarkResult.AsObject>,
  leftHand: Array<LandmarkResult.AsObject>,
  rightHand: Array<LandmarkResult.AsObject>,
  pose: Array<LandmarkVisibilityResult.AsObject>,
  poseWorld: Array<LandmarkVisibilityResult.AsObject>,
}

class StreamResponseDto {
  sessionId: string;
  sequence: number;
  startedAt: number;
  fps: number;
  timestamp: number[];
  step: number[];
  dataSize: number[];
  result: InferenceResult;

  constructor(inferenceResponse: InferenceResponse, fps: number) {
    const responseObj = inferenceResponse.toObject();
    const serverTime = Date.now();
    responseObj.stepList.push(serverTime - responseObj.timestampList.at(-1));
    responseObj.timestampList.push(serverTime);
    this.sessionId = responseObj.sessionid;
    this.sequence = responseObj.sequence;
    this.startedAt = responseObj.startedat;
    this.fps = fps;
    this.timestamp = responseObj.timestampList;
    this.step = responseObj.stepList;
    this.dataSize = responseObj.datasizeList;
    this.result = {
      face: responseObj.result.faceList,
      leftHand: responseObj.result.leftHandList,
      rightHand: responseObj.result.rightHandList,
      pose: responseObj.result.poseList,
      poseWorld: responseObj.result.poseWorldList
    }
  }

  public static fromResponse(inferenceResponse: InferenceResponse, fps: number) {
    return new StreamResponseDto(inferenceResponse, fps);
  }
}

export default StreamResponseDto;