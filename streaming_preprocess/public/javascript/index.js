import { connectStreamPreProcess } from './socket.js';
import { socketHost, socketPath, camera, videoElement, bufferCanvas, changedContext, changedCanvas, bufferContext } from './context.js';

let flag = false;

let fps = 0;
let frameCount = 0;
let interval = 1000;
let lastTime = performance.now();

const calculateFrame = () => {
  const currTime = performance.now();
  const elapsedTime = lastTime ? currTime - lastTime : 0;

  frameCount++;
  if (elapsedTime >= interval) {
    fps = Math.round(frameCount / (elapsedTime / 1000));
    frameCount = 0;
    lastTime = currTime;
  }

  return fps;
}

const blobOption = {
  quality: 0.5,
  progressive: true
}

const image = new Image();

image.onload = () => {
  changedContext.drawImage(image, 0, 0, changedCanvas.width, changedCanvas.height);
}

const handleFrame = () => {
  if (!flag) return;

  bufferContext.drawImage(videoElement, 0, 0, bufferCanvas.width, bufferCanvas.height);
  bufferCanvas.toBlob((blob) => {
    const blobUrl = URL.createObjectURL(blob);
    image.src = blobUrl;
  }, 'image/png', 0.5);

  requestAnimationFrame(handleFrame);
}

const loadVideo = async () => {
  if (flag) return;
  
  flag = true;
  
  // camera.start();
  navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480, frameRate: { ideal: 60, max: 60 } } })
  .then((stream) => {
      videoElement.srcObject = stream;
      videoElement.play();

      requestAnimationFrame(handleFrame);
    })
    .catch((error) => {
      console.log(error);
    })
};

const stopVideo = () => {
  if (!flag) return;

  flag = false;

  // camera.stop();
  videoElement.srcObject = null;
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