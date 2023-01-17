class PreStreamDto {
  sessionId: string;
  frame: string;

  constructor(sessionId: string, frame: string) {
    this.sessionId = sessionId;
    this.frame = frame;
  }

  public static fromData(sessionId: string, frame: string) {
    return new PreStreamDto(sessionId, frame);
  }
}

export default PreStreamDto;
