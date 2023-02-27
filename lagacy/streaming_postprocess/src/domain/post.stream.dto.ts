class PostStreamDto {
  sessionId: string;
  sequence: number;
  result: any;
  startedAt: number;
  timestamp: number[];
  step: number[];
  fps?: number;
}

export default PostStreamDto;
