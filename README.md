# Implement Client JS webpage
A complete client‑side graphical user interface (GUI), consisting of an HTML webpage, CSS styling, and the JavaScript logic contained in home.js. The GUI provides the user with an interactive and responsive interface for initiating and stopping real‑time sensor data streaming, visualizing incoming data using Plotly, and exporting the resulting graph in a LaTeX‑compatible PGF format.

The HTML structure defines the layout of the page, including the **Run Sensor Data**, **Stop**, and **Download Graph buttons**, as well as the **Plotly graph container**. The CSS stylesheet ensures that the interface is visually clear, responsive, and user‑friendly. The JavaScript logic manages user interactions, WebSocket communication, real‑time Plotly updates, and graph export functionality.

# Features
* When the button is clicked, the client must send a start‑stream request to the Node.js server (via WebSocket or HTTP, depending on design).
* The server sends sensor readings at approximately 1 Hz, matching the upstream data rate from the Python Serial Reader.
* The client maintains an active WebSocket connection and listen for incoming messages.
* Upon receiving each message, the client must update the Plotly graph in real time.

# Overview
## The request–response workflow

## Message format

## Client‑side update logic

## Integration with Plotly

## HTML structure

## WebSocket connection logic

## Plotly update mechanism

## PGF/TikZ export workflow

## UI state transitions (Run → Streaming → Stop → Download)
