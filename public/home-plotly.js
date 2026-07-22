// --- Imports ---------------------------------------------------------------
import { getUTC7Parts, partsToPlotlyISOString, formatUTC7Display} from "./home-time_zone.js";
import {
  plotDiv,
  currentLuxEl,
  currentTimeEl,
  logListEl
} from "./home-DOM.js"

// --- Plotly setup ----------------------------------------------------------
const plotLayout = {
  paper_bgcolor: "transparent",
  plot_bgcolor: "transparent",
  font: { color: "#e7eef0", family: "IBM Plex Mono, monospace", size: 12 },
  margin: { l: 50, r: 20, t: 20, b: 40 },
  xaxis: { title: "Time", gridcolor: "#1e2a2d", zeroline: false },
  yaxis: { title: "BH1750 - Light Intensity Sensor (LUX)", gridcolor: "#1e2a2d", zeroline: false },
  showlegend: false,
};

const plotConfig = { responsive: true, displayModeBar: false };

// --- Local state (per tab/session) ---------------------------------------
export const state = {
  ws: null,
  streaming: false,
  xData: [],
  yData: [],
};

export function initPlot() {
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

// --- Graph and Panel updates ------------------------------------------------------
export function appendPoint(timestamp, value) {
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

// --- Graph export (SVG / PNG / JSON) ------------------

function buildExportLayout() {
  return {
    ...plotLayout,
    paper_bgcolor: "#ffffff",
    plot_bgcolor: "#ffffff",
    font: { ...plotLayout.font, color: "#111111" },
    xaxis: {
      ...plotLayout.xaxis,
      gridcolor: "#cccccc",
      zerolinecolor: "#cccccc",
      linecolor: "#111111",
      tickfont: { color: "#111111" },
    },
    yaxis: {
      ...plotLayout.yaxis,
      gridcolor: "#cccccc",
      zerolinecolor: "#cccccc",
      linecolor: "#111111",
      tickfont: { color: "#111111" },
    },
  };
}

async function downloadImageFormat(format) {
  const hiddenDiv = document.createElement("div");
  hiddenDiv.style.position = "fixed";
  hiddenDiv.style.top = "0";
  hiddenDiv.style.left = "-9999px";
  hiddenDiv.style.width = "900px";
  hiddenDiv.style.height = "500px";
  document.body.appendChild(hiddenDiv);
 
  try {
    await Plotly.newPlot(hiddenDiv, plotDiv.data, buildExportLayout(), {
      staticPlot: true,
    });
    await Plotly.downloadImage(hiddenDiv, {
      format,
      filename: "sensor-graph",
      width: 900,
      height: 500,
    });
  } finally {
    Plotly.purge(hiddenDiv);
    hiddenDiv.remove();
  }
}

function downloadJSON() {
  const exportObject = {
    data: plotDiv.data,
    layout: plotDiv.layout,
  };
  const blob = new Blob([JSON.stringify(exportObject, null, 2)], {
    type: "application/json",
  });
  triggerDownload(blob, "sensor-graph.json");
}

function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function downloadGraph(format) {
  if (format === "json") {
    downloadJSON();
  } else {
    downloadImageFormat(format);
  }
}
