class FrameManager {
  private fps: number = 0;
  private frameCount: number = 0;
  private interval: number = 1000;
  private lastTime: number = performance.now();

  calculateFrame() {
    const currTime = performance.now();
    const elapsedTime = this.lastTime ? currTime - this.lastTime : 0;

    this.frameCount++;
    if (elapsedTime >= this.interval) {
      this.fps = Math.round(this.frameCount / (elapsedTime / 1000));
      this.frameCount = 0;
      this.lastTime = currTime;
    }

    return this.fps;
  }
}

export default FrameManager;