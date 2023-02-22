import { connectStreamPreProcess } from './socket.js';
import { socketHost, socketPath, fixedFPS, videoElement, bufferCanvas, bufferContext, bufferQueue, socket, videoInfo } from './context.js';

let flag = false;

const handleFrame = () => {
  if (!flag) return;

  bufferContext.drawImage(videoElement, 0, 0, bufferCanvas.width, bufferCanvas.height);
  bufferCanvas.toBlob(async (blob) => {
    if (blob.size <= 100000) return;
    const base64 = bufferCanvas.toDataURL('image/png', 1);
    bufferQueue.push(base64);
    videoInfo.sequence++;
    socket.preProcess.emit('client:preprocess:stream', { sequence: videoInfo.sequence, frame: blob, timestamp: Date.now() });
  }, 'image/png', 0.5);

}

const loadVideo = async () => {
  if (flag) return;
  
  flag = true;

  videoInfo.sequence = 0;
  videoInfo.startedAt = new Date();
  videoInfo.fps = [];
  for (const key in videoInfo.latency) {
    videoInfo.latency[key] = [];
  }
  
  // camera.start();
  navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480, frameRate: { ideal: 60, max: 60 } } })
  .then((stream) => {
      videoElement.srcObject = stream;
      videoElement.play();

      const cameraInterval = setInterval(() => {
        if (!flag) {
            clearInterval(cameraInterval);
            return;
        }
        handleFrame();
    }, 1000 / fixedFPS);
    })
    .catch((error) => {
      console.log(error);
    })
};

const stopVideo = () => {
  if (!flag) return;

  flag = false;

  videoElement.srcObject = null;
  const host = `${window.location.protocol}//${window.location.host.split(':')[0]}`;
  const calculateLatency = (name, list) => {
    const max = Math.max(...list);
    const min = Math.min(...list);
    const avg = (list.reduce((a, b) => a + b, 0) / list.length).toFixed(2);
    return `[${name}] - 최소: ${min}ms, 최대: ${max}ms, 평균: ${avg}ms`;
  }

  if (!videoInfo.fps.length) return;

  axios.post(`${host}/auth/slack`, {
    text: `Latency 테스트 - ${videoInfo.startedAt}\n총 테스트 시간 - ${(new Date().getTime() - videoInfo.startedAt.getTime()) / 1000}초\n처리된 Frame 개수 - ${videoInfo.sequence}\nFPS - 최소: ${Math.min(...videoInfo.fps)}, 최대: ${Math.max(...videoInfo.fps)}, 평균: ${(videoInfo.fps.reduce((a, b) => a + b, 0) / videoInfo.fps.length).toFixed(2)}\n\n\n${calculateLatency("Client -> Input Server", videoInfo.latency.input)}\n${calculateLatency("Input Server -> Inference Server", videoInfo.latency.messageQueue)}\n${calculateLatency("Inference Processing", videoInfo.latency.inference)}\n${calculateLatency("Inference Server -> Output Server", videoInfo.latency.output)}\n${calculateLatency("Output Server -> Client", videoInfo.latency.client)}\n\n==========================================\n\n`
  })

};

export const initialHostSetting = async (environment) => {
  const host = `${window.location.protocol}//${window.location.host.split(':')[0]}`;

  await axios.get(`${environment === 'prod' ? host : `${host}:3000`}/auth/code`).catch((error) => {
    window.location.href = '/entrypoint';
  });

  socketHost.preprocess = environment === 'prod' ? `${host}` : `${host}:4000`;
  socketHost.postprocess = environment === 'prod' ? `${host}` : `${host}:5000`;
  socketPath.preprocess = environment === 'prod' ? '/preprocess' : '/socket.io';
  socketPath.postprocess = environment === 'prod' ? '/postprocess' : '/socket.io';

  connectStreamPreProcess();
};

document.getElementById('button-start').addEventListener('click', loadVideo);
document.getElementById('button-stop').addEventListener('click', stopVideo);