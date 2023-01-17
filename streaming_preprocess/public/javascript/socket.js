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
  const image = new Image();
  const changedCanvas = document.getElementById('changed-canvas');
  const originCanvas = document.getElementById('origin-canvas');
  const changedContext = changedCanvas.getContext('2d');
  const originContext = originCanvas.getContext('2d');

  socket.postProcess.on('server:postprocess:stream', async (results) => {
    const base64Data = bufferQueue.pop();

    console.log(results);
    image.onload = () => {
      changedContext.save();
      changedContext.drawImage(image, 0, 0, changedCanvas.width, changedCanvas.height);
      originContext.drawImage(image, 0, 0);

      changedContext.globalCompositeOperation = 'source-over';
      drawConnectors(changedContext, results.pose, POSE_CONNECTIONS, { color: '#00FF00', lineWidth: 0.5 });
      drawLandmarks(changedContext, results.pose, { color: '#FF0000', lineWidth: 1 });
      drawConnectors(changedContext, results.face, FACEMESH_TESSELATION, { color: '#C0C0C070', lineWidth: 0.5 });
      drawConnectors(changedContext, results.left_hand, HAND_CONNECTIONS, { color: '#CC0000', lineWidth: 0.5 });
      drawLandmarks(changedContext, results.left_hand, { color: '#00FF00', lineWidth: 0.5 });
      drawConnectors(changedContext, results.right_hand, HAND_CONNECTIONS, { color: '#00CC00', lineWidth: 0.5 });
      drawLandmarks(changedContext, results.right_hand, { color: '#FF0000', lineWidth: 0.5 });

      changedContext.restore();
    };
    image.src = 'data:image/png;base64,' + base64Data;
  });
};
