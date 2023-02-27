class BufferQueue {
  _list = [];

  firstSequence() {
    return this._list[0].sequence;
  }

  push(sequence, buffer) {
    this._list.push({ sequence, buffer });
  }

  pop(sequence) {
    for (let bufferSequence = this.firstSequence(); bufferSequence !== sequence;)
      this._list.shift();
    return this._list.shift().buffer;
  }
}

const socket = {
  io: undefined,
  host: undefined,
}

const latencyChecker = {
  input: [],
  messageQueue: [],
  inference: [],
  output: [],
  client: []
}

const videoInfo = {
  sequence: 0,
  startedAt: 0,
  fps: [],
  latency: latencyChecker
}

const fixedFPS = 30;
const bufferQueue = new BufferQueue();
const sessionId = document.cookie
  ? document.cookie
    .split('; ')
    .find((elem) => elem.includes('sessionId'))
    .split('=')[1]
  : '';


export { socket, bufferQueue, sessionId, videoInfo, fixedFPS };