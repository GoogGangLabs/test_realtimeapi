const socket = {
  request: undefined,
  response: undefined,
};

const connectStreamRequest = () => {
  socket.request = io('http://localhost:3001');
  console.log(socket.request);
};
