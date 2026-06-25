# Websocket Communication Channel
A both-sides WebSocket Communication Channel is implemented that enables real‑time data transfer between the Python Serial Reader and the Node.js server. The WebSocket layer provides a persistent, bidirectional communication mechanism that allows sensor readings to be pushed immediately to the server without polling or delays. This component is essential for achieving low‑latency updates in the GUI Dashboard and ensuring that the system behaves as a continuous data pipeline.

The WebSocket channel will be implemented on both ends:
* A Python WebSocket client responsible for connecting to the Node.js server and transmitting JSON‑formatted sensor data.
* A Node.js WebSocket server responsible for receiving messages, validating them, and broadcasting updates to connected GUI clients.

# Features
* A WebSocket server is implemented in Node.js using a suitable library (e.g., ws).
* The WebSocket server starts automatically when the Node.js application is launched.
* A Python WebSocket client is implemented and able to connect to the Node.js WebSocket server.
* The Python client must successfully transmit JSON‑formatted sensor data at a frequency of approximately 1 Hz.
* The Node.js server broadcasts received messages to all connected GUI clients.
* The communication channel remains active during continuous operation without unexpected disconnections.

# Overview
## Connection setup

## Message format

## Expected communication flow

## Runtime behavior
