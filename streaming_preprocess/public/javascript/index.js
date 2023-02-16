import { connectStreamPreProcess } from './socket.js';
import { socketHost, socketPath, camera } from './context.js';

let flag = false;

const loadVideo = async () => {
  if (flag) return;

  flag = true;

  camera.start();
};

const stopVideo = () => {
  if (!flag) return;

  flag = false;

  camera.stop();
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