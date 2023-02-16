import { socket, socketPath, socketHost, bufferQueue, sessionId } from './context.js';

const streamPreProcessOn = () => {
  socket.preProcess.on('server:preprocess:connection', () => {
    connectStreamPostProcess();
  });

  socket.preProcess.on('server:preprocess:error', (message) => {
    window.location.href = '/entrypoint';
    alert(message);
  });
};

const streamPostProcessOn = () => {
  const image = new Image();
  const changedCanvas = document.getElementById('changed-canvas');
  const originCanvas = document.getElementById('origin-canvas');
  const changedContext = changedCanvas.getContext('2d');
  const originContext = originCanvas.getContext('2d');

  socket.postProcess.on('server:postprocess:error', (message) => {
    window.location.href = '/entrypoint';
    alert(message);
  });

  socket.postProcess.on('server:postprocess:stream', (data) => {
    const base64Data = bufferQueue.pop(data.sequence);
    const results = data.results;

    image.onload = () => {
      changedContext.save();
      changedContext.drawImage(image, 0, 0, changedCanvas.width, changedCanvas.height);
      originContext.drawImage(image, 0, 0, originCanvas.width, originCanvas.height);

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

const connectStreamPostProcess = () => {
  socket.postProcess = io(socketHost.postprocess, { path: socketPath.postprocess, extraHeaders: { sessionId } });
  streamPostProcessOn();
};

export const connectStreamPreProcess = () => {
  socket.preProcess = io(socketHost.preprocess, { path: socketPath.preprocess, extraHeaders: { sessionId } });
  streamPreProcessOn();
};
