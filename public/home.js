/**
 * home.js — Sensor Data Stream client logic
 *
 * WIRE PROTOCOL (Assumption to create a working model first):
 *   Client -> Server:
 *     { type: "start" }                         // begin streaming
 *     { type: "stop"  }                          // stop streaming
 *
 *   Server -> Client:
 *     { type: "data", timestamp: <ms|iso>, value: <number> }
 *     { type: "error", message: <string> }       // optional, for surfacing server issues
 *
 * Each browser tab that loads this page opens its own WebSocket connection
 * and owns its own `state` object + its own Plotly instance (#plot), so
 * multiple simultaneous users/tabs are naturally independent —> nothing
 * is shared across page loads.
 */

// --- Configuration -----------------------------------------------------
// Note: Swap with ngrok URL when ready
const WS_URL = "ws://localhost:3000";

// --- DOM references ------------------------------------------------------
const runBtn = document.getElementById("runBtn");
const stopBtn = document.getElementById("stopBtn");
const downloadBtn = document.getElementById("downloadBtn");
const statusEl = document.getElementById("status");
const statusDot = document.getElementById("statusDot");
const statusLabel = document.getElementById("statusLabel");
const hint = document.getElementById("hint");
const plotDiv = document.getElementById("plot");

// --- Local state (per tab/session) ---------------------------------------
const state = {
  ws: null,
  streaming: false,
  xData: [],
  yData: [],
};

// --- Plotly setup ----------------------------------------------------------
const plotLayout = {
  paper_bgcolor: "transparent",
  plot_bgcolor: "transparent",
  font: { color: "#e7eef0", family: "IBM Plex Mono, monospace", size: 12 },
  margin: { l: 50, r: 20, t: 20, b: 40 },
  xaxis: { title: "Time", gridcolor: "#1e2a2d", zeroline: false },
  yaxis: { title: "Value", gridcolor: "#1e2a2d", zeroline: false },
  showlegend: false,
};

const plotConfig = { responsive: true, displayModeBar: false };

function initPlot() {
  const trace = {
    x: [],
    y: [],
    mode: "lines+markers",
    type: "scatter",
    line: { color: "#35d0ba", width: 2 },
    marker: { size: 4, color: "#35d0ba" },
  };
  Plotly.newPlot(plotDiv, [trace], plotLayout, plotConfig);
}

initPlot();

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
function connectAndStart() {
  setStatus("connecting", "Connecting…");
  runBtn.disabled = true; // prevent double-clicks while connecting

  const ws = new WebSocket(WS_URL);
  state.ws = ws;

  // Main structure to check for any message event on WS
  ws.addEventListener("open", () => {
    setStatus("live", "Streaming");
    setStreamingUI(true);
    // Reset the graph for a fresh run
    state.xData = [];
    state.yData = [];
    initPlot();
  });

  ws.addEventListener("message", (event) => { // when message received is data
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

function stopStreaming() {
  if (state.ws && state.ws.readyState === WebSocket.OPEN) {
    state.ws.close();
  }
  setStreamingUI(false);
  setStatus("idle", "Disconnected");
  downloadBtn.disabled = state.xData.length === 0;
}

// --- Graph updates ------------------------------------------------------
function appendPoint(timestamp, value) {
  const x = timestamp !== undefined ? timestamp : new Date().toISOString();
  state.xData.push(x);
  state.yData.push(value);

  Plotly.extendTraces(plotDiv, { x: [[x]], y: [[value]] }, [0]);

  // Keep only the most recent N points visible to avoid the graph
  // becoming unreadable during long streams
  const MAX_VISIBLE = 200;
  if (state.xData.length > MAX_VISIBLE) {
    const excess = state.xData.length - MAX_VISIBLE;
    Plotly.relayout(plotDiv, {
      "xaxis.range": [state.xData[excess], x],
    });
  }
}

// --- Graph export (SVG now, other formats maybe later) ------------------
function downloadGraph() {
  Plotly.downloadImage(plotDiv, {
    format: "svg",
    filename: "sensor-graph",
    width: 900,
    height: 500,
  });
}

// --- Event wiring ------------------------------------------------------
runBtn.addEventListener("click", connectAndStart);
stopBtn.addEventListener("click", stopStreaming);
downloadBtn.addEventListener("click", downloadGraph);
