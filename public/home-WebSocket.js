// --- Imports -----------------------------------------------------------
import {
  runBtn,
  stopBtn,
  downloadBtn,
  statusEl,
  statusDot,
  statusLabel,
  hint,
  plotDiv,
  currentLuxEl,
  currentTimeEl,
  logListEl
} from "./home-DOM.js"

import {state, initPlot, appendPoint} from "./home-plotly.js"

// --- Configuration -----------------------------------------------------
// Matches server.js: http.createServer + WebSocket.Server on the same port.
const WS_URL = "ws://localhost:3000";

// --- UI state helpers ------------------------------------------------------
function setStatus(mode, label) {
  statusEl.classList.remove("is-live", "is-error");
  if (mode === "live") statusEl.classList.add("is-live");
  if (mode === "error") statusEl.classList.add("is-error");
  statusLabel.textContent = label;
}

function setStreamingUI(isStreaming) {
  state.streaming = isStreaming;
  runBtn.disabled = isStreaming;
  stopBtn.disabled = !isStreaming;
  hint.innerHTML = isStreaming
    ? "Streaming live sensor data&hellip; click <strong>Stop</strong> to end the session."
    : "Click <strong>Run Sensor Data</strong> to start streaming.";
}

// --- WebSocket handling ------------------------------------------------------
export function connectAndStart() {
  setStatus("connecting", "Connecting…");
  runBtn.disabled = true; // prevent double-clicks while connecting

  const ws = new WebSocket(WS_URL);
  state.ws = ws;

  ws.addEventListener("open", () => {
    setStatus("live", "Streaming");
    setStreamingUI(true);
    // Reset the graph for a fresh run
    state.xData = [];
    state.yData = [];
    initPlot();
    currentLuxEl.textContent = "\u2014";
    currentTimeEl.textContent = "\u2014";
    logListEl.innerHTML = "";
  });

  ws.addEventListener("message", (event) => {
    let msg;
    try {
      msg = JSON.parse(event.data);
    } catch (err) {
      console.error("Received non-JSON message:", event.data);
      return;
    }

    if (msg.type === "sensor") {
      appendPoint(msg.timestamp, msg.lux);
    } else if (msg.type === "error") {
      console.error("Server error:", msg.message);
      setStatus("error", "Server error");
    } else {
      console.warn("Unhandled message type:", msg.type);
    }
  });

  ws.addEventListener("close", () => {
    setStatus("idle", "Disconnected");
    setStreamingUI(false);
    downloadBtn.disabled = state.xData.length === 0;
  });

  ws.addEventListener("error", (err) => {
    console.error("WebSocket error:", err);
    setStatus("error", "Connection error");
  });
}

export function stopStreaming() {
  if (state.ws && state.ws.readyState === WebSocket.OPEN) {
    state.ws.close();
  }
  setStreamingUI(false);
  setStatus("idle", "Disconnected");
  downloadBtn.disabled = state.xData.length === 0;
}