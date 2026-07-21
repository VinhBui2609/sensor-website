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
 * Each browser tab that loads this page opens its own WebSocket connection
 * and owns its own `state` object + its own Plotly instance (#plot), so
 * each tab renders its own independent graph — though note the underlying
 * data stream itself is shared/broadcast, not per-tab.
 */

// --- Imports -----------------------------------------------------------
import { runBtn, stopBtn, downloadBtn } from "./home-DOM.js";
import { initPlot, downloadGraph } from "./home-plotly.js";
import { connectAndStart, stopStreaming } from "./home-WebSocket.js";

initPlot();

// --- Event wiring ------------------------------------------------------
runBtn.addEventListener("click", connectAndStart);
stopBtn.addEventListener("click", stopStreaming);
downloadBtn.addEventListener("click", downloadGraph);