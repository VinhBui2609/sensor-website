/**
 * home.js — Sensor Data Stream client logic
 *
 * WIRE PROTOCOL (matches the current server.js):
 *
 *   Client -> Server:
 *     (nothing — this client is listen-only)
 *
 *   Server -> Client (broadcast to ALL connected clients, not per-session):
 *     { type: "sensor", lux: <number>, timestamp: <ISO string> }
 *     { type: "error", message: <string> }
 *
 * IMPORTANT: the sensor stream is driven entirely by the Python serial
 * reader, which connects and starts pushing readings on its own — it does
 * not wait for any signal from the browser. server.js broadcasts every
 * reading to every open socket, with no per-client start/stop control.
 * "Run" here means "open a socket and start listening to whatever's
 * already flowing." "Stop" means "close my own socket" — it has no effect
 * on the sensor itself or on any other connected tab.
 *
 * Each browser tab that loads this page opens its own WebSocket connection
 * and owns its own `state` object + its own Plotly instance (#plot), so
 * each tab renders its own independent graph — though note the underlying
 * data stream itself is shared/broadcast, not per-tab.
 */

// --- Configuration -----------------------------------------------------
// Matches server.js: http.createServer + WebSocket.Server on the same port.
// Swap this for your groupmate's ngrok URL (wss://...) once that's live.
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
const currentLuxEl = document.getElementById("currentLux");
const currentTimeEl = document.getElementById("currentTime");
const logListEl = document.getElementById("logList");

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
  yaxis: { title: "Lux", gridcolor: "#1e2a2d", zeroline: false },
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

function stopStreaming() {
  if (state.ws && state.ws.readyState === WebSocket.OPEN) {
    state.ws.close();
  }
  setStreamingUI(false);
  setStatus("idle", "Disconnected");
  downloadBtn.disabled = state.xData.length === 0;
}

// --- Timezone handling (UTC+7) ------------------------------------------
const UTC7_PART_FORMATTER = new Intl.DateTimeFormat("en-US", {
  timeZone: "Asia/Ho_Chi_Minh",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
});

function getUTC7Parts(timestamp) {
  const date = new Date(timestamp);
  const parts = UTC7_PART_FORMATTER.formatToParts(date).reduce((acc, p) => {
    acc[p.type] = p.value;
    return acc;
  }, {});
  if (parts.hour === "24") parts.hour = "00";
  return parts;
}

function partsToPlotlyISOString(parts) {
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}:${parts.second}.000Z`;
}

function formatUTC7Display(parts) {
  return `${parts.day}/${parts.month}/${parts.year} ${parts.hour}:${parts.minute}:${parts.second}`;
}

// --- Graph updates ------------------------------------------------------
function appendPoint(timestamp, value) {
  const raw = timestamp !== undefined ? timestamp : new Date().toISOString();
  const parts = getUTC7Parts(raw);
  const x = partsToPlotlyISOString(parts);

  state.xData.push(x);
  state.yData.push(value);

  Plotly.extendTraces(plotDiv, { x: [[x]], y: [[value]] }, [0]);

  // Keep only the most recent N points visible to avoid the graph
  // becoming unreadable during long streams. Adjust as needed.
  const MAX_VISIBLE = 200;
  if (state.xData.length > MAX_VISIBLE) {
    const excess = state.xData.length - MAX_VISIBLE;
    Plotly.relayout(plotDiv, {
      "xaxis.range": [state.xData[excess], x],
    });
  }

  updateReadingPanel(parts, value);
}

function updateReadingPanel(parts, value) {
  const formattedTime = formatUTC7Display(parts);

  currentLuxEl.textContent = value.toFixed(2);
  currentTimeEl.textContent = formattedTime;

  const row = document.createElement("div");
  row.className = "log__row";
  row.innerHTML = `<span class="log__lux">${value.toFixed(2)} lux</span><span>${formattedTime}</span>`;
  logListEl.prepend(row);

  // Cap the log so it doesn't grow unbounded during a long stream.
  const MAX_LOG_ROWS = 50;
  while (logListEl.children.length > MAX_LOG_ROWS) {
    logListEl.removeChild(logListEl.lastChild);
  }
}

// --- Graph export (SVG, for later PGF/TikZ conversion) ------------------
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