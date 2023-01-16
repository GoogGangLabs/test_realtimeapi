const serverHost = `${window.location.protocol}//${window.location.host.split(':')[0]}`;
const socket = {
  preProcess: undefined,
  postProcess: undefined,
};

const connectStreamPreProcess = () => {
  socket.preProcess = io(`${serverHost}:4000`);
  streamPreProcessOn();
};

const connectStreamPostProcess = (sessionId) => {
  socket.postProcess = io(`${serverHost}:5000`, { extraHeaders: { sessionId } });
  streamPostProcessOn();
};

const streamPreProcessOn = () => {
  socket.preProcess.on('server:preprocess:connection', (sessionId) => {
    connectStreamPostProcess(sessionId);
  });
};

const streamPostProcessOn = () => {
  const changedImage = document.getElementById('changed-image');
  let workerUrl = undefined;

  socket.postProcess.on('server:postprocess:stream', (base64) => {
    if (workerUrl) {
      // todo: BLOB 데이터 메모리 해제 로직 구현해야 함
      URL.revokeObjectURL(workerUrl);
    }

    changedImage.src = null;
    const blob = bufferQueue.pop();
    workerUrl = URL.createObjectURL(blob);
    changedImage.src = URL.createObjectURL(blob);
  });
};
