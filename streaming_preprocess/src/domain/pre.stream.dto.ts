class PreStreamDto {
  sequence: number;
  sessionId: string;
  frame: any;
  startedAt: number;

  /**
   * 0: Preprocess
   * 1: Inference Processing Before
   * 2: Inference Processing After
   * 3: Postprocess
   * 4: Client arrive
   */
  timestamp: number[] = new Array<number>();

  /**
   * 0: Client -> Preprocess
   * 1: Preprocess -> Inference
   * 2: Inference Processing
   * 3: Inference -> Postprocess
   * 4: Postprocess -> Client
   */
  step: number[] = new Array<number>();

  constructor(sessionId: string, sequence: number, frame: any, timestamp: number) {
    this.sessionId = sessionId;
    this.sequence = sequence;
    this.frame = frame;

    const serverTime = Date.now();

    this.startedAt = timestamp;
    this.timestamp.push(serverTime);
    this.step.push(serverTime - timestamp);
  }

  public static fromData(sessionId: string, sequence: number, frame: any, timestamp: number) {
    return new PreStreamDto(sessionId, sequence, frame, timestamp);
  }
}

export default PreStreamDto;
