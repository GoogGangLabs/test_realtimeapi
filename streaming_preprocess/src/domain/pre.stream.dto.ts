class PreStreamDto {
  sessionId: string;
  frame: string;

  constructor(sessionId: string, frame: string) {
    this.sessionId = sessionId;
    this.frame = frame;
  }

  public static fromData(sessionId: string, frame: Buffer) {
    return new PreStreamDto(sessionId, frame.toString('base64'));
  }
}

export default PreStreamDto;
