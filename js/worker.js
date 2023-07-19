self.onmessage = function(event) {
  const parsedData = JSON.parse(event.data);
  self.postMessage(parsedData);
};
