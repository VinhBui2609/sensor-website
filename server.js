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

    switch (payload.type) {
      case "sensor":
        if (
          !Number.isFinite(Number(payload.lux)) ||
          Number(payload.lux) < 0
        ) {
          socket.send(JSON.stringify({
            type: "error",
            message: "Invalid lux value."
          }));
          return;
        }
    
        const sensorMessage = JSON.stringify({
          type: "sensor",
          lux: Number(payload.lux),
          timestamp: new Date().toISOString()
        });
    
        console.log("Sensor:", sensorMessage);
    
        for (const client of wss.clients) {
          if (client.readyState === WebSocket.OPEN) {
            client.send(sensorMessage);
          }
        }
    
        break;
    
    
      case "command":
    
        console.log("Command:", payload.command);
    
        // Later:
        // send to Python
        // send to STM32
        // etc.
    
        break;
    
    
      default:
    
        socket.send(JSON.stringify({
          type: "error",
          message: "Unknown message type."
        }));
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
