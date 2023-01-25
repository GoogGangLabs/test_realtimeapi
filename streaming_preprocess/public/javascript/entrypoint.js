const host = `${window.location.protocol}//${window.location.host}`;

const entrance = async () => {
  const input = document.getElementById('code');
  await axios
    .post(`${host}/auth/code`, { code: input.value || ' ' })
    .then((response) => {
      if (response.status === 200) {
        window.location.href = '/';
      }
    })
    .catch((error) => {
      alert(error.response.data.message);
    });
  input.value = '';
};

window.onload = async () => {
  await axios.get(`${host}/auth/code`).then((response) => {
    if (response.status === 200) {
      window.location.href = '/';
    }
  });
};
