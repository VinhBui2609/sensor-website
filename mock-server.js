/**
 * mock-server.js — stand-in for the real Node.js backend
 *
 * Mimics server.js's actual behavior: starts streaming as soon as a
 * client connects, no "start" message required (since home.js is
 * listen-only and never sends one).
 *
 * Run:   node mock-server.js
 * ws://localhost:8080
 */

const WebSocket = require("ws");

const PORT = 3000;
const wss = new WebSocket.Server({ port: PORT });

console.log(`Mock sensor server listening on ws://localhost:${PORT}`);

wss.on("connection", (ws) => {
  console.log("Client connected");

  const interval = setInterval(() => {
    const payload = {
      type: "sensor",
      timestamp: new Date().toISOString(),
      lux: Math.round((Math.sin(Date.now() / 2000) * 10 + 20 + (Math.random() - 0.5) * 3) * 100) / 100,
    };
    ws.send(JSON.stringify(payload));
  }, 500);

  ws.on("close", () => {
    console.log("Client disconnected");
    clearInterval(interval);
  });

  ws.on("error", (err) => console.error("WS error:", err));
});