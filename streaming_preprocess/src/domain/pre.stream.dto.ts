class PreStreamDto {
  sequence: number;
  sessionId: string;
  frame: string;

  constructor(sessionId: string, sequence: number, frame: string) {
    this.sessionId = sessionId;
    this.sequence = sequence;
    this.frame = frame;
  }

  public static fromData(sessionId: string, sequence: number, frame: string) {
    return new PreStreamDto(sessionId, sequence, frame);
  }
}

export default PreStreamDto;
