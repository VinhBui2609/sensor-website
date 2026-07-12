/**
 * mock-server.js — stand-in for the real Node.js backend
 *
 * Run:   node mock-server.js
 * ws://localhost:8080
 */

const WebSocket = require("ws");

const PORT = 8080;
const wss = new WebSocket.Server({ port: PORT });

console.log(`Mock sensor server listening on ws://localhost:${PORT}`);

wss.on("connection", (ws) => {
  console.log("Client connected");
  let interval = null;

  ws.on("message", (raw) => {
    let msg;
    try {
      msg = JSON.parse(raw);
    } catch {
      console.warn("Received non-JSON message:", raw.toString());
      return;
    }

    console.log("Received:", msg);

    if (msg.type === "start") {
      if (interval) return; // already streaming
      interval = setInterval(() => {
        const payload = {
          type: "data",
          timestamp: new Date().toISOString(),
          // Fake sensor reading for testing purposes
          value: Math.round((Math.sin(Date.now() / 2000) * 10 + 20 + (Math.random() - 0.5) * 3) * 100) / 100,
        };
        ws.send(JSON.stringify(payload));
      }, 500);
    }

    if (msg.type === "stop") {
      if (interval) {
        clearInterval(interval);
        interval = null;
      }
    }
  });

  ws.on("close", () => {
    console.log("Client disconnected");
    if (interval) clearInterval(interval);
  });

  ws.on("error", (err) => console.error("WS error:", err));
});
