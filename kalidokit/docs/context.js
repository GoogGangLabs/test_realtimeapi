class BufferQueue {
  _list = [];

  push(buffer) {
    this._list.push([buffer, Date.now()]);
  }

  pop(sequence, fps) {
    const [buffer, start] = this._list.shift();
    console.log(`${sequence}: ${fps}fps, ${Date.now() - start}ms`);
    return buffer;
  }
}

const socketHost = {
  preprocess: undefined,
  postprocess: undefined,
};

const socketPath = {
  preprocess: undefined,
  postprocess: undefined,
};

const socket = {
  preProcess: undefined,
  postProcess: undefined,
};

const bufferQueue = new BufferQueue();
const sessionId = document.cookie
  ? document.cookie
    .split('; ')
    .find((elem) => elem.includes('sessionId'))
    .split('=')[1]
  : '';


export { socketHost, socketPath, socket, bufferQueue, sessionId };