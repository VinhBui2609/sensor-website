const express = require("express");
const path = require("path");
const http = require("http");
const WebSocket = require("ws");

const app = express();
const PORT = 3000;
const ROOT = __dirname;

app.use(express.static(path.join(ROOT, "website")));

app.get("/", (req, res) => {
  res.sendFile(path.join(ROOT, "website", "test.html"));
});

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

wss.on("connection", (socket, request) => {
  const host = request.headers.host || `localhost:${PORT}`;
  const url = new URL(request.url, `http://${host}`);
  socket.role = url.searchParams.get("role") || "gui";

  console.log(`WebSocket connected: ${socket.role}`);

  socket.on("message", (data) => {
    if (socket.role !== "producer") {
      socket.send(JSON.stringify({
        type: "error",
        message: "Only a producer can send sensor data."
      }));
      return;
    }

    let payload;

    try {
      payload = JSON.parse(data.toString());
    } catch {
      socket.send(JSON.stringify({
        type: "error",
        message: "Invalid JSON."
      }));
      return;
    }

    if (
      payload.sensor !== "BH1750" ||
      !Number.isFinite(Number(payload.lux)) ||
      Number(payload.lux) < 0
    ) {
      socket.send(JSON.stringify({
        type: "error",
        message: "Expected BH1750 data with a non-negative lux value."
      }));
      return;
    }

    const outgoingMessage = JSON.stringify({
      sensor: "BH1750",
      lux: Number(payload.lux),
      timestamp: new Date().toISOString()
    });

    console.log(`Received from Python: ${outgoingMessage}`);

    for (const client of wss.clients) {
      if (
        client.role === "gui" &&
        client.readyState === WebSocket.OPEN
      ) {
        client.send(outgoingMessage);
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
  console.log(`Producer: ws://localhost:${PORT}/?role=producer`);
  console.log(`GUI: ws://localhost:${PORT}/?role=gui`);
});
