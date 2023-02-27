import LatencyRequestDto, { StreamInfo } from "@domain/latency.request.dto";

export interface OperationResult {
  min: number;
  max: number;
  avg: string;
}

interface StreamOperationDetail {
  input: OperationResult;
  output: OperationResult;
  grpc?: OperationResult;
  inference?: OperationResult;
  client?: OperationResult;
}

export interface StreamOperationResult {
  latency: StreamOperationDetail;
  dataSize: StreamOperationDetail;
  totalLatency: OperationResult;
  totalDataSize: OperationResult;
  fps: OperationResult;
}

class CalculateLatency {
  private static getOperationResult(list: number[], isExceptZero = false): OperationResult {
    const validList = !isExceptZero ? [...list] : [...list].filter(e => e > 0);
    return {
      min: Math.min(...validList),
      max: Math.max(...validList),
      avg: (validList.reduce((a, b) => a + b, 0) / validList.length).toFixed(2)
    }
  }

  private static getTotalOperationResult(latency: StreamInfo) {
    const getPositive = (num: number) => num > 0 ? num : 0;
    const validList = Array.from({ length: latency.client.length }, (_, idx) => {
      let count = 0;
      for (const key in latency)
        count += getPositive(validList[key][idx]);
      return count;
    });
    return this.getOperationResult(validList);
  }

  public static getByteLength(s: string, b = 0, i = 0, c = 0): number {
    for(b=i=0;c=s.charCodeAt(i++);b+=c>>11?3:c>>7?2:1);
    return b;
  }

  public static fromRequest(latencyRequest: LatencyRequestDto): StreamOperationResult {
    return {
      latency: {
        input: this.getOperationResult(latencyRequest.latencyInfo.input),
        grpc: this.getOperationResult(latencyRequest.latencyInfo.grpc),
        inference: this.getOperationResult(latencyRequest.latencyInfo.inference),
        output: this.getOperationResult(latencyRequest.latencyInfo.output),
        client: this.getOperationResult(latencyRequest.latencyInfo.client),
      },
      dataSize: {
        input: this.getOperationResult(latencyRequest.dataSizeInfo.input),
        output: this.getOperationResult(latencyRequest.dataSizeInfo.output),
      },
      totalLatency: this.getTotalOperationResult(latencyRequest.latencyInfo),
      totalDataSize: this.getTotalOperationResult(latencyRequest.dataSizeInfo),
      fps: this.getOperationResult(latencyRequest.fpsList)
    }
  }
}

export default CalculateLatency;