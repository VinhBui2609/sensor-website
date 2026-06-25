# Node.js Server
A Node.js server responsible for hosting the web application and enabling external access for real‑time monitoring. The task includes installing the Node.js runtime environment, configuring an Express‑based HTTP server, and verifying that the server runs reliably on the local machine. Additionally, the story includes integrating ngrok to expose the local server to the public internet, enabling remote access for testing and demonstration purposes.

The Node.js server forms a core component of the system architecture, acting as the central hub that receives data from the Python Serial Reader, manages WebSocket connections, and serves the GUI dashboard to clients. The server must support multiple simultaneous users, each maintaining an independent WebSocket session, while all clients receive the same real‑time sensor data stream. This story ensures that the server environment is fully operational, non‑blocking, and ready for integration with upstream and downstream components.

# Features
* An Express‑based HTTP server will be implemented and able to start without errors.
* The server responds correctly to HTTP requests (e.g., returning a basic HTML page or JSON response).
* The server runs continuously without unexpected termination during local testing.
* The server supports multiple concurrent WebSocket clients, each receiving real‑time sensor data without blocking or interference.
* **ngrok** will be configured to expose the local server to the public internet.
