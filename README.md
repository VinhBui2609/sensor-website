# Implement Client JS webpage
A complete client‑side graphical user interface (GUI), consisting of an HTML webpage, CSS styling, and the JavaScript logic contained in home.js. The GUI provides the user with an interactive and responsive interface for initiating and stopping real‑time sensor data streaming, visualizing incoming data using Plotly, and exporting the resulting graph in a LaTeX‑compatible PGF format.

The HTML structure defines the layout of the page, including the **Run Sensor Data**, **Stop**, and **Download Graph buttons**, as well as the **Plotly graph container**. The CSS stylesheet ensures that the interface is visually clear, responsive, and user‑friendly. The JavaScript logic manages user interactions, WebSocket communication, real‑time Plotly updates, and graph export functionality.

# Features
* When the button is clicked, the client must send a start‑stream request to the Node.js server (via WebSocket).
* The server sends sensor readings at approximately 1 Hz, matching the upstream data rate from the Python Serial Reader.
* The client maintains an active WebSocket connection and listen for incoming messages.
* Upon receiving each message, the client must update the Plotly graph in real time.

# Test run
* To test run this webpage, type the following command in a bash or terminal opened at the location of `mock-server.js`:
'''bash
npm install
node mock-server.js
'''

# Overview

## The request–response workflow
The client never polls the server; instead it opens a single persistent WebSocket connection and reacts to events on it.

1. User clicks **Run Sensor Data** → `connectAndStart()` opens `new WebSocket(WS_URL)`.
2. On the socket's `open` event, the client sends `{ type: "start" }` to the server, resets the Plotly graph, and flips the UI into "streaming" state.
3. The server begins pushing one `data` message per reading (currently tested at ~2 Hz against the mock server. Should match Python Serial Reader's ~1 Hz rate when it is assimilated).
4. The client's `message` listener fires once per incoming reading, parses it, and forwards it to `appendPoint()`, which updates the graph.
5. User clicks **Stop** → `stopStreaming()` sends `{ type: "stop" }` and closes the socket. The server's `close` event on its side is expected to stop emitting readings.

No page reload or manual refresh -> entire cycle is driven by WebSocket events.

## Message format
A minimal JSON protocol was defined so the client and `server.js` can be developed independently against a shared contract:

**Client → Server**
```json
{ "type": "start" }
{ "type": "stop" }
```

**Server → Client**
```json
{ "type": "data", "timestamp": "2026-07-12T08:29:24.098Z", "value": 11.6 }
{ "type": "error", "message": "..." }
```

Ofcourse, this implementation is but an assumption so that a working prototype can be built. This message format can be easily changed to match those of the actual server whenever that is ready

## Client‑side update logic
Each client tab keeps its own local `state` object (`ws`, `streaming`, `xData`, `yData`). Since nothing is stored globally -> multiple simultaneous tabs/users each get an independent session and graph automatically.

`appendPoint(timestamp, value)` is the single function responsible for turning an incoming reading into a graph update:
* Pushes the new `x`/`y` values into `state.xData` / `state.yData`.
* Calls `Plotly.extendTraces()` to add the point without redrawing the whole chart.
* Once more than 200 points have accumulated, it uses `Plotly.relayout()` to slide the visible x‑axis window forward, keeping the most recent data readable during long streams instead of compressing the whole history into view. This is done to maintain visibility, further alteration to fit the report format possible.

## Integration with Plotly
Plotly is loaded from its CDN (`cdn.plot.ly`) before `home.js` runs, so `home.js` can call the global `Plotly` object directly with no bundler or import step.

* `initPlot()` calls `Plotly.newPlot()` once, with a single empty `scatter` trace styled to match the dashboard's dark theme (`plotLayout`, `plotConfig`).
* Live updates use `Plotly.extendTraces()` rather than re-calling `newPlot()` — this appends to the existing trace efficiently instead of redrawing the entire chart on every reading -> keeps the animation smooth at the ~1–2 Hz update rate.
* `downloadGraph()` calls `Plotly.downloadImage(plotDiv, { format: "svg", ... })`, exporting the current chart as an SVG file. This SVG is intended as the input to a separate PGF/TikZ conversion step (e.g. `svg2tikz`) for inclusion in the LaTeX report. This step is still to be developed.

## HTML structure
`index.html` defines the page layout as a DOM tree:
* A header containing the page title and a live connection **status indicator** (colored dot + label — idle / connecting / streaming / error).
* A `panel` containing:
  * `panel__controls` — the three buttons (`#runBtn`, `#stopBtn`, `#downloadBtn`), laid out with flexbox so they wrap responsively on narrow screens.
  * `panel__graph` — the `#plot` container div that Plotly renders into.
  * A hint line whose text updates depending on streaming state.
* Elements that JavaScript needs to reference carry `id` attributes (`runBtn`, `stopBtn`, `downloadBtn`, `plot`, `status`, `statusDot`, `statusLabel`, `hint`), which `home.js` looks up once via `document.getElementById()`.

## WebSocket connection logic
`connectAndStart()` and `stopStreaming()` in `home.js` manage the socket's lifecycle using the standard WebSocket event API:
* **`open`** — connection succeeded; update status to "Streaming," reset the graph, send the `start` message.
* **`message`** — a reading arrived; `event.data` is parsed as JSON and dispatched based on its `type` field (`data` → `appendPoint()`, `error` → surfaced to status/console).
* **`close`** — connection ended (whether via Stop or a drop); UI resets to "Disconnected" and re-enables the Download button if any data was captured.
* **`error`** — connection‑level failure; status is flagged as an error state.

The server address is centralized in a single `WS_URL` constant, so switching from the local mock server (`ws://localhost:8080`) to the real backend's ngrok URL (`wss://...ngrok-free.app`) is a one-line change.

## Plotly update mechanism
See *Integration with Plotly* above — the key point architecturally is the split between a one-time `Plotly.newPlot()` (structure/style setup, called once per streaming session) and repeated `Plotly.extendTraces()` calls (cheap incremental updates, called once per reading), which is what allows the graph to update in real time without visible redraw lag.

## UI state transitions (Run → Streaming → Stop → Download)
`setStreamingUI(isStreaming)` is the single function that drives all button/hint state, so the UI can't drift out of sync with the actual connection state:

| State | Run button | Stop button | Hint text |
|---|---|---|---|
| Idle | enabled | disabled | "Click Run Sensor Data to start streaming." |
| Streaming | disabled | enabled | "Streaming live sensor data…" |
| Stopped | enabled | disabled | back to idle text |

The **Download Graph** button is enabled independently, as soon as at least one data point has been received (`state.xData.length > 0`), and remains enabled after stopping so the user can export the completed graph — it is not tied to the Run/Stop toggle itself.

**Still to be validated:** all of the above has been tested end-to-end against `mock-server.js`, not yet against the real `server.js`. Integration testing with the actual backend, plus more graceful handling of an unexpected connection drop (as opposed to a user-initiated Stop), remains outstanding.