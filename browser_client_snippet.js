const sensorSocket = new WebSocket(
  `ws://${window.location.host}/?role=gui`
);

sensorSocket.addEventListener("open", () => {
  console.log("GUI connected to WebSocket server");
});

sensorSocket.addEventListener("message", (event) => {
  const data = JSON.parse(event.data);
  console.log("BH1750 reading:", data);

  // Example:
  // document.getElementById("luxValue").textContent = data.lux;
});

sensorSocket.addEventListener("close", () => {
  console.log("GUI disconnected from WebSocket server");
});
