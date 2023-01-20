const socketHost = {
  preprocess: undefined,
  postprocess: undefined,
};
const socket = {
  preProcess: undefined,
  postProcess: undefined,
};

function connect(ctx, connectors) {
  const canvas = ctx.canvas;

  for (const connector of connectors) {
    const from = connector[0];
    const to = connector[1];
    if (from && to) {
      if (from.visibility && to.visibility && (from.visibility < 0.1 || to.visibility < 0.1)) {
        continue;
      }
      ctx.beginPath();
      ctx.moveTo(from.x * canvas.width, from.y * canvas.height);
      ctx.lineTo(to.x * canvas.width, to.y * canvas.height);
      ctx.stroke();
    }
  }
}

const connectStreamPreProcess = () => {
  socket.preProcess = io(socketHost.preprocess);
  streamPreProcessOn();
};

const connectStreamPostProcess = (sessionId) => {
  socket.postProcess = io(socketHost.postprocess, { extraHeaders: { sessionId } });
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

    image.onload = () => {
      changedContext.save();
      changedContext.drawImage(image, 0, 0, changedCanvas.width, changedCanvas.height);
      originContext.drawImage(image, 0, 0);

      changedContext.globalCompositeOperation = 'source-over';

      if (results.pose.length > 0) {
        for (let i = 0; i < 23; i++) {
          if (i > 10 && i < 17) continue;
          results.pose[i] = [0, 0, 0, 0];
        }
      }

      /* Face */
      drawConnectors(changedContext, results.face, FACEMESH_TESSELATION, { color: '#C0C0C070', lineWidth: 1 });
      drawConnectors(changedContext, results.face, FACEMESH_RIGHT_EYE, { color: 'rgb(0,217,231)', lineWidth: 1 });
      drawConnectors(changedContext, results.face, FACEMESH_RIGHT_EYEBROW, { color: 'rgb(0,217,231)', lineWidth: 1 });
      drawConnectors(changedContext, results.face, FACEMESH_LEFT_EYE, { color: 'rgb(255,138,0)', lineWidth: 1 });
      drawConnectors(changedContext, results.face, FACEMESH_LEFT_EYEBROW, { color: 'rgb(255,138,0)', lineWidth: 1 });
      drawConnectors(changedContext, results.face, FACEMESH_FACE_OVAL, { color: '#E0E0E0', lineWidth: 1 });
      drawConnectors(changedContext, results.face, FACEMESH_LIPS, { color: '#E0E0E0', lineWidth: 1 });

      /* Pose */
      drawConnectors(changedContext, results.pose, POSE_CONNECTIONS, { color: 'white', lineWidth: 2 });

      /* Left Hand */
      drawConnectors(changedContext, results.left_hand, HAND_CONNECTIONS, { color: 'rgb(255,138,0)', lineWidth: 1.5 });

      /* Right Hand */
      drawConnectors(changedContext, results.right_hand, HAND_CONNECTIONS, { color: 'rgb(0,217,231)', lineWidth: 2 });

      changedContext.restore();
    };
    image.src = 'data:image/jpeg;base64,' + base64Data;
  });
};
