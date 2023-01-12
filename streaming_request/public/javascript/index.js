const start = () => {
  const mediaDevices = navigator.mediaDevices;
  const originalVideo = document.getElementById('originalVideo');
  const mediaPipeVideo = document.getElementById('mediaPipeVideo');

  if (!mediaDevices || !mediaDevices.getUserMedia) {
    alert('웹캠 사용이 가능한 디바이스로 접속해주세요.');
    return;
  }

  mediaDevices
    .getUserMedia({ video: true })
    .then((stream) => {
      originalVideo.srcObject = stream;
      mediaPipeVideo.srcObject = stream;
    })
    .catch((err) => {
      console.log(err);
    });
};

const end = () => {
  const originalVideo = document.getElementById('originalVideo');
  const mediaPipeVideo = document.getElementById('mediaPipeVideo');

  if (!originalVideo.srcObject) return;

  originalVideo.srcObject.getTracks()[0].stop();

  originalVideo.srcObject = null;
  mediaPipeVideo.srcObject = null;
};
