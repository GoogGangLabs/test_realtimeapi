let stream = null;
let flag = false;

const loadVideo = async () => {
  const originCanvas = document.getElementById('origin-canvas');
  const changedCanvas = document.getElementById('changed-canvas');
  const originContext = originCanvas.getContext('2d');
  const changedContext = changedCanvas.getContext('2d');
  const inputVideo = document.getElementById('input-video');

  await navigator.mediaDevices
    .getUserMedia({ video: true })
    .then((media) => {
      const inputVideo = document.getElementById('input-video');

      stream = media;
      inputVideo.srcObject = media;
      inputVideo.play();
    })
    .catch((err) => console.log(err));

  flag = true;

  const loop = async () => {
    originContext.save();
    changedContext.save();

    originContext.drawImage(inputVideo, 0, 0, originCanvas.width, originCanvas.height);
    changedContext.drawImage(inputVideo, 0, 0, changedCanvas.width, changedCanvas.height);

    originContext.restore();
    changedContext.restore();

    if (flag) requestAnimationFrame(loop);
  };

  await loop();
};

const end = () => {
  const inputVideo = document.getElementById('input-video');

  if (!flag) return;

  flag = false;
  stream.getTracks()[0].stop();
  stream = null;
  inputVideo.srcObject = null;
};

window.onload = () => {
  connectStreamRequest();
};
