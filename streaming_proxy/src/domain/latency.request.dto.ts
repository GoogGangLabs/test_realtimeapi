import { IsArray, IsNotEmpty, IsNumber } from 'class-validator';

export class StreamInfo {
  @IsNotEmpty()
  @IsArray()
  input: number[];
  @IsNotEmpty()
  @IsArray()
  output: number[];
  @IsNotEmpty()
  @IsArray()
  grpc?: number[];
  @IsNotEmpty()
  @IsArray()
  inference?: number[];
  @IsNotEmpty()
  @IsArray()
  client?: number[];
}

class LatencyRequestDto {
  @IsNotEmpty()
  @IsNumber()
  startedAt: number;
  @IsNotEmpty()
  @IsNumber()
  totalLatency: number;
  @IsNotEmpty()
  @IsNumber()
  fixedFps: number;
  @IsNotEmpty()
  fpsList: number[];
  @IsNotEmpty()
  latencyInfo: StreamInfo;
  @IsNotEmpty()
  dataSizeInfo: StreamInfo;
}

export default LatencyRequestDto;