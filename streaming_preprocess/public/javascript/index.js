class BufferQueue {
  _list = [];

  push(buffer) {
    this._list.push(buffer);
  }

  pop() {
    return this._list.shift();
  }
}

let flag = false;
const bufferQueue = new BufferQueue();

const loopVideoFrame = () => {
  const inputVideo = document.getElementById('input-video');
  const bufferCanvas = document.getElementById('buffer-canvas');

  const loopInterval = setInterval(() => {
    if (!flag) clearInterval(loopInterval);

    bufferCanvas.getContext('2d').drawImage(inputVideo, 0, 0, bufferCanvas.width, bufferCanvas.height);
    const frame = bufferCanvas.toDataURL('image/jpeg', 1).split(',')[1];

    if (frame.length === 1392) return;

    bufferQueue.push(frame);
    socket.preProcess.emit('client:preprocess:stream', { frame });
  }, 100);
};

const loadVideo = async () => {
  if (flag) return;

  flag = true;

  await navigator.mediaDevices
    .getUserMedia({ video: true })
    .then((media) => {
      const inputVideo = document.getElementById('input-video');

      inputVideo.srcObject = media;
      inputVideo.play();
    })
    .catch(() => stopVideo());

  loopVideoFrame();
};

const stopVideo = () => {
  const inputVideo = document.getElementById('input-video');

  if (!flag) return;

  if (inputVideo.srcObject) {
    inputVideo.srcObject.getTracks()[0].stop();
    inputVideo.srcObject = null;
  }

  flag = false;
};

const initialHostSetting = (environment) => {
  const host = `${window.location.protocol}//${window.location.host.split(':')[0]}`;

  socketHost.preprocess = environment === 'prod' ? `${host}` : `${host}:4000`;
  socketHost.postprocess = environment === 'prod' ? `${host}` : `${host}:5000`;
  socketPath.preprocess = environment === 'prod' ? '/preprocess' : '/socket.io';
  socketPath.postprocess = environment === 'prod' ? '/postprocess' : '/socket.io';

  connectStreamPreProcess();
};
