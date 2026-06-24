# PROJECT DESCRIPTION
This project is a real-time embedded-to-web data acquisition system that collects data of BH1750 - Light Intensity Sensor from a hardware device (e.g., STM32 or ESP32) and transmits it to a web-based dashboard.

The system allows users to:

* View live sensor data streamed from a microcontroller
Control data output using a toggle button (start/stop transmission)
Visualize sensor data in real time using an interactive graph

* The embedded device continuously reads data from a connected sensor (e.g., temperature, humidity, or analog sensor). The data is sent to a backend server via serial communication (UART/USB/WiFi). A web application displays the data and provides user interaction features.

This project demonstrates integration of:

* Embedded systems (sensor + MCU)
* Communication protocols (UART / WebSocket / HTTP)
* Backend server (Flask / Node.js)
* Frontend web development (HTML, CSS, JavaScript)
* Real-time data visualization


# PROJECT FEATURES
* Acquire real-time data from a physical sensor
* Transmit data from MCU to computer/server
* Build a web interface to display sensor values
* Implement user controls (start/stop data streaming)
* Plot sensor data in real time
* Ensure stable and continuous communication between hardware and web system

**The architecture must reflect the following high‑level pipeline:**

[Sensor](https://github.com/VinhBui2609/sensor-website/blob/features/BH1750-sensor/README.md)
➡️ [Python Serial Reader](https://github.com/VinhBui2609/sensor-website/blob/features/PySerial/README.md)
➡️ [WebSocket Channel](https://github.com/VinhBui2609/sensor-website/blob/features/Websocket/README.md)
➡️ [Node.js Server](https://github.com/VinhBui2609/sensor-website/blob/features/server/README.md)
➡️ [GUI Dashboard](https://github.com/VinhBui2609/sensor-website/blob/features/client/README.md)
