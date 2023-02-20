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

/** todo: Client에서 fps 고정을 할 지 고민해봐야 함 */
// const loopVideoFrame = () => {
//   const loopInterval = setInterval(() => {
//     if (!flag) clearInterval(loopInterval);

//     bufferCanvas.getContext('2d').drawImage(videoElement, 0, 0, bufferCanvas.width, bufferCanvas.height);
//     const frame = bufferCanvas.toDataURL('image/jpeg', 1).split(',')[1];

//     bufferQueue.push(frame);
//     socket.preProcess.emit('client:preprocess:stream', { frame });
//   }, 100);
// };

const camera = new Camera(videoElement, {
  onFrame: () => {
    bufferCanvas.getContext('2d').drawImage(videoElement, 0, 0, bufferCanvas.width, bufferCanvas.height);
    const frame = bufferCanvas.toDataURL('image/jpeg', 1).split(',')[1];

    bufferQueue.push(frame);
    socket.preProcess.emit('client:preprocess:stream', { frame });
  },
  width: 640,
  height: 480
});

export { socketHost, socketPath, socket, bufferQueue, sessionId };
export { videoElement, changedCanvas, originCanvas, bufferCanvas };
export { camera, changedContext, originContext, bufferContext };