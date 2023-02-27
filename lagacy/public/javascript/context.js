class BufferQueue {
  _list = [];

  push(buffer) {
    this._list.push([buffer, Date.now()]);
  }

  pop() {
    const [buffer] = this._list.shift();
    return buffer;
  }
}

const socketHost = {
  preprocess: undefined,
};

const socketPath = {
  preprocess: undefined,
};

const socket = {
  preProcess: undefined,
};

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

const videoElement = document.getElementById('input-video');
const changedCanvas = document.getElementById('changed-canvas');
const originCanvas = document.getElementById('origin-canvas');
const bufferCanvas = document.getElementById('buffer-canvas');
const changedContext = changedCanvas.getContext('2d');
const originContext = originCanvas.getContext('2d');
const bufferContext = bufferCanvas.getContext('2d');
changedCanvas.width = 640;
changedCanvas.height = 480;
bufferCanvas.width = 640;
bufferCanvas.height = 480;
changedCanvas.width = 640;
changedCanvas.height = 480;
originCanvas.width = 640;
originCanvas.height = 480;

export { socketHost, socketPath, socket, bufferQueue, sessionId, fixedFPS, latencyChecker, videoInfo };
export { videoElement, changedCanvas, originCanvas, bufferCanvas };
export { changedContext, originContext, bufferContext };