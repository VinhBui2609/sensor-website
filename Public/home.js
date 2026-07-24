// --- Imports -----------------------------------------------------------
import { runBtn, stopBtn, downloadBtn, downloadDropdown, downloadMenu } from "./home-DOM.js";
import { initPlot, downloadGraph } from "./home-plotly.js";
import { connectAndStart, stopStreaming } from "./home-WebSocket.js";

initPlot();

// --- Event wiring ------------------------------------------------------
runBtn.addEventListener("click", connectAndStart);
stopBtn.addEventListener("click", stopStreaming);

// --- Dropdown menu behavior --------------------------------------------
// Open menu
downloadBtn.addEventListener("click", (event) => {
  event.stopPropagation();
  downloadMenu.classList.toggle("is-open");
});

// Close menu
document.addEventListener("click", (event) => {
  if (!downloadDropdown.contains(event.target)) {
    downloadMenu.classList.remove("is-open");
  }
});

// Format Selected -> get format type from HTML
downloadMenu.querySelectorAll(".dropdown__item").forEach((item) => {
  item.addEventListener("click", () => {
    downloadMenu.classList.remove("is-open");
    downloadGraph(item.dataset.format);
  });
});