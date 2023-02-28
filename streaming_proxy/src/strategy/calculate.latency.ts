import LatencyRequestDto, { StreamInfo } from "@domain/latency.request.dto";

export interface OperationResult {
  min: number;
  max: number;
  avg: number | string;
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
  private static getOperationResult(list: number[], options?: { isExceptZero?: boolean, isData?: boolean }): OperationResult {
    let validList = options && options.isExceptZero ? [...list].filter(e => e > 0) : [...list];
    if (options && options.isData) {
      validList = validList.map(element => parseFloat((element / 1024).toFixed(2)));
    }
    return {
      min: Math.min(...validList),
      max: Math.max(...validList),
      avg: options && options.isData
            ? (validList.reduce((a, b) => a + b, 0) / validList.length).toFixed(2)
            : Math.round(validList.reduce((a, b) => a + b, 0) / validList.length)
    }
  }

  private static getTotalOperationResult(latency: StreamInfo, isData = false) {
    const validList = Array.from({ length: latency.output.length }, (_, idx) => {
      let count = 0;
      for (const key in latency)
        count += latency[key][idx];
      return count;
    });
    return this.getOperationResult(validList, { isData });
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
        input: this.getOperationResult(latencyRequest.dataSizeInfo.input, { isData: true }),
        output: this.getOperationResult(latencyRequest.dataSizeInfo.output, { isData: true }),
      },
      totalLatency: this.getTotalOperationResult(latencyRequest.latencyInfo),
      totalDataSize: this.getTotalOperationResult(latencyRequest.dataSizeInfo, true),
      fps: this.getOperationResult(latencyRequest.fpsList, { isExceptZero: true })
    }
  }
}

export default CalculateLatency;