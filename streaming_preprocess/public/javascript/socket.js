const socket = {
  preProcess: undefined,
  postProcess: undefined,
};

const connectStreamPreProcess = () => {
  socket.preProcess = io('http://localhost:3001');
  streamPreProcessOn();
};

const connectStreamPostProcess = (sessionId) => {
  socket.postProcess = io('http://localhost:4001', { extraHeaders: { sessionId } });
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
    // if (workerUrl) {
    //   // todo: BLOB 데이터 메모리 해제 로직 구현해야 함
    //   URL.revokeObjectURL(workerUrl);
    // }

    // changedImage.src = null;
    // const blob = bufferQueue.pop();
    // const blob = bufferQueue.pop();
    // workerUrl = URL.createObjectURL(blob);
    // console.log(base64);

    changedImage.src = `data:image/jpeg;base64,${base64}`;
  });
};
