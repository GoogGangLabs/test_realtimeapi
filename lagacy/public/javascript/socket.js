import { socket, socketPath, socketHost, bufferQueue, sessionId, videoInfo } from './context.js';

const checkLatency = (step, fps) => {
  videoInfo.latency.input.push(step[0]);
  videoInfo.latency.messageQueue.push(step[1]);
  videoInfo.latency.inference.push(step[2]);
  videoInfo.latency.output.push(step[3]);
  videoInfo.latency.client.push(step[4]);
  videoInfo.fps.push(fps);
}

const streamPreProcessOn = () => {
  socket.preProcess.on('server:preprocess:connection', () => {
  });

  socket.preProcess.on('server:preprocess:error', (message) => {
    window.location.href = '/entrypoint';
    alert(message);
  });

  const image = new Image();
  const changedCanvas = document.getElementById('changed-canvas');
  const originCanvas = document.getElementById('origin-canvas');
  const changedContext = changedCanvas.getContext('2d');
  const originContext = originCanvas.getContext('2d');

  
  socket.preProcess.on('server:postprocess:stream', (data) => {
    const clientTime = Date.now();
    data.step.push(clientTime - data.timestamp[data.timestamp.length - 1]);
    data.timestamp.push(clientTime);
    checkLatency(data.step, data.fps);
    console.log(data);

    const base64Data = bufferQueue.pop(data.sequence);
    const results = data.result;
    const fps = data.fps;
    const latency = clientTime - data.startedAt;
  
  
    image.onload = () => {
      changedContext.save();
      changedContext.drawImage(image, 0, 0, changedCanvas.width, changedCanvas.height);
      originContext.drawImage(image, 0, 0, originCanvas.width, originCanvas.height);
  
      changedContext.globalCompositeOperation = 'source-over';
  
      changedContext.fillStyle = 'red';
      changedContext.font = "15px sans-serif";
      changedContext.fillText(`Latency: ${latency}ms`, 10, 20);
      changedContext.fillText(`FPS: ${fps}`, 10, 40);
  
      if (results.pose.length > 0) {
        for (let i = 0; i < 23; i++) {
          if (i > 10 && i < 17) continue;
          results.pose[i] = {x: 0, y: 0, z: 0, visibility: 0};
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
    image.src = base64Data;
  });
};

export const connectStreamPreProcess = () => {
  socket.preProcess = io(socketHost.preprocess, { path: socketPath.preprocess, extraHeaders: { sessionId } });
  streamPreProcessOn();
};
