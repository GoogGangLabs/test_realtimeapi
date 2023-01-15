class BufferQueue {
  _list = [];

  push(buffer) {
    this._list.push(buffer);
  }

  pop() {
    return this._list.shift();
  }

  // todo: delete: test code
  size() {
    console.log(this._list.length);
  }
}

let flag = false;
const bufferQueue = new BufferQueue();

const loopVideoFrame = () => {
  const inputVideo = document.getElementById('input-video');
  const capture = new ImageCapture(inputVideo.srcObject.getVideoTracks()[0]);

  const loopInterval = setInterval(async () => {
    if (!flag) clearInterval(loopInterval);

    await capture
      .takePhoto()
      .then((blob) => {
        // bufferQueue.push(blob);
        socket.preProcess.emit('client:preprocess:stream', { frame: blob });
      })
      .catch((err) => console.log(err));
  }, 50);
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

window.onload = () => {
  connectStreamPreProcess();
};
