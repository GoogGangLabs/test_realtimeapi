import { connectStreamPreProcess } from './socket.js';
import { socketHost, socketPath, fixedFPS, videoElement, bufferCanvas, bufferContext, bufferQueue, socket, videoInfo } from './context.js';

let flag = false;

const handleFrame = () => {
  if (!flag) return;

  bufferContext.drawImage(videoElement, 0, 0, bufferCanvas.width, bufferCanvas.height);
  const base64 = bufferCanvas.toDataURL('image/jpeg', 0.3);
  
  if (base64.length <= 1000) return;
  
  const imageData = base64.split(',')[1];
  const compressedData = pako.deflate(imageData, { level: 9 });

  bufferQueue.push(base64);
  videoInfo.sequence++;
  console.log(`${((base64.length - compressedData.length) / base64.length * 100).toFixed(2)}% 압축: ${base64.length} >> ${compressedData.length}`)
  socket.preProcess.emit('client:preprocess:stream', { sequence: videoInfo.sequence, frame: compressedData, timestamp: Date.now() });
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

  videoElement.srcObject.getTracks()[0].stop();
  videoElement.srcObject = null;
  const host = `${window.location.protocol}//${window.location.host.split(':')[0]}`;
  const calculateLatency = (name, list) => {
    const max = Math.max(...list);
    const min = Math.min(...list);
    const avg = (list.reduce((a, b) => a + b, 0) / list.length).toFixed(2);
    return `${name} - 평균: ${avg}ms, 최소: ${min}ms, 최대: ${max}ms`;
  }
  const totalLatency = () => {
    const latency = videoInfo.latency;
    const total = Array.from({ length: latency.client.length }, (_, idx) => (latency.input[idx] + latency.messageQueue[idx] + latency.inference[idx] + latency.output[idx] + latency.client[idx]));
    const max = Math.max(...total);
    const min = Math.min(...total);
    const avg = (total.reduce((a, b) => a + b, 0) / total.length).toFixed(2);
    return `Latency - 평균: ${avg}ms, 최소: ${min}ms, 최대: ${max}ms`;
  }

  if (!videoInfo.fps.length) return;

  axios.post(`${host}/auth/slack`, {
    text: `Latency 테스트 - ${videoInfo.startedAt}\n총 테스트 시간 - ${(Date.now() - videoInfo.startedAt) / 1000}초\n처리된 Frame 개수 - ${videoInfo.latency.output.length}\nFPS - 평균: ${(videoInfo.fps.reduce((a, b) => a + b, 0) / videoInfo.fps.length).toFixed(2)}, 최소: ${Math.min(...videoInfo.fps)}, 최대: ${Math.max(...videoInfo.fps)}\n${totalLatency()}\n\n\n${calculateLatency("1️⃣", videoInfo.latency.input)}\n${calculateLatency("2️⃣", videoInfo.latency.messageQueue)}\n${calculateLatency("3️⃣", videoInfo.latency.inference)}\n${calculateLatency("4️⃣", videoInfo.latency.output)}\n${calculateLatency("5️⃣", videoInfo.latency.client)}\n\n==========================================\n\n`
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