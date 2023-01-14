const socket = {
  request: undefined,
  response: undefined,
};

const connectStreamRequest = () => {
  socket.request = io('http://localhost:3001');
  streamRequestOn();
};

const streamRequestOn = () => {
  const changedImage = document.getElementById('changed-image');

  socket.request.on('test1', () => {
    if (workerUrl) {
      // todo: BLOB 데이터 메모리 해제 로직 구현해야 함
      URL.revokeObjectURL(workerUrl);
    }

    changedImage.src = null;
    const blob = bufferQueue.pop();
    workerUrl = URL.createObjectURL(blob);

    changedImage.src = workerUrl;
  });
};
