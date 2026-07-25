const express = require("express");
const path = require("path");
const http = require("http");
const WebSocket = require("ws");

const app = express();
const PORT = 3000;
const ROOT = __dirname;

app.use(express.static(path.join(ROOT, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(ROOT, "public", "index.html"));
});

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

wss.on("connection", (socket, request) => {
  const host = request.headers.host || `localhost:${PORT}`;
  console.log("WebSocket connected");

  socket.on("message", (data) => {
  let lux;

  try {
    lux = JSON.parse(data.toString());
  } catch {
    return;
  }

  if (!Number.isFinite(Number(lux)) || Number(lux) < 0) {
    return;
  }

  const sensorMessage = JSON.stringify(Number(lux));

  console.log("Lux:", lux);

  for (const client of wss.clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(sensorMessage);
    }
  }
  });

  socket.on("close", () => {
    console.log(`WebSocket disconnected: ${socket.role}`);
  });

  socket.on("error", (error) => {
    console.error("WebSocket error:", error.message);
  });
});

server.listen(PORT, () => {
  console.log(`HTTP server: http://localhost:${PORT}`);
});
