# Real-Time Light Intensity Monitoring System

A real-time light intensity monitoring system using the **BH1750 digital light sensor**, **STM32 microcontroller**, **Python**, **WebSocket**, and a **Node.js web server**.

The system measures ambient light intensity in **lux (lx)** and displays the measurements in real time through a web-based graphical user interface.

## Overview

This project integrates an embedded sensor system with a web-based monitoring platform. The BH1750 sensor measures ambient light intensity and communicates with the STM32 microcontroller through the **I²C interface**.

The STM32 transmits the measured illumination through a USB Virtual COM Port to a Python application running on a Windows computer. The Python application reads and validates the sensor data, converts it into JSON format, and sends it to the Node.js backend through a **WebSocket connection**.

The Node.js server then broadcasts the received measurements to connected web clients. The frontend displays the current illumination value and plots the measurements in real time using **Plotly.js**.

## System Architecture

```text
┌───────────────┐
│    BH1750     │
│ Light Sensor  │
└───────┬───────┘
        │ I²C
        ▼
┌───────────────┐
│     STM32     │
│ Microcontroller│
└───────┬───────┘
        │ USB / Virtual COM
        │
        ▼
┌───────────────┐
│ Python Serial │
│    Reader     │
└───────┬───────┘
        │ WebSocket
        │ JSON number
        ▼
┌───────────────┐
│   Node.js     │
│ Express + ws  │
└───────┬───────┘
        │ WebSocket
        │ Broadcast
        ▼
┌────────────────────────┐
│ Web-Based User Interface│
│ HTML + CSS + JavaScript │
│       Plotly.js         │
└────────────────────────┘
```

## Features

* Real-time ambient light intensity measurement
* BH1750 sensor with I²C communication
* STM32-based sensor acquisition
* USB Virtual COM Port communication
* Python serial data acquisition
* WebSocket-based real-time communication
* Node.js and Express backend
* Real-time Plotly graph
* Current lux value and timestamp display
* UTC+7 time display
* Graph export in **PNG, SVG, and JSON**
* Multiple browser clients supported
* Remote access using **ngrok**

## Hardware

| Component      | Description                                  |
| -------------- | -------------------------------------------- |
| BH1750         | Digital ambient light intensity sensor       |
| STM32          | Microcontroller for sensor acquisition       |
| USB connection | Virtual COM Port for serial communication    |
| Computer       | Runs the Python reader and/or Node.js server |

The BH1750 communicates with the STM32 through the I²C interface. The measured raw value is converted into illumination according to the sensor datasheet:

```text
Lux = Raw Output / 1.2
```

## Software

* **STM32CubeIDE** — STM32 firmware development
* **C / STM32 HAL** — Embedded firmware
* **Python 3** — Serial data acquisition
* **PySerial** — USB Virtual COM Port communication
* **websocket-client** — Python WebSocket communication
* **Node.js** — Backend runtime
* **Express.js** — Web server
* **ws** — WebSocket server
* **HTML / CSS / JavaScript** — Frontend
* **Plotly.js** — Real-time data visualization
* **ngrok** — Public access to the local web server

## Project Structure

```text
sensor-website/
│
├── public/
│   ├── index.html
│   ├── home.js
│   ├── home-DOM.js
│   ├── home-time_zone.js
│   └── style.css
│
├── Sensor/
│   └── read_sensor.py
│
├── BH1750/
│   ├── BH1750.c
│   └── BH1750.h
│
├── server.js
├── package.json
├── package-lock.json
└── README.md
```

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/VinhBui2609/sensor-website.git
cd sensor-website
```

### 2. Install Node.js dependencies

```bash
npm install
```

### 3. Install Python dependencies

```bash
pip install pyserial websocket-client
```

## Running the System

### Step 1 — Start the Node.js server

From the project directory:

```bash
node server.js
```

The server should start at:

```text
http://localhost:3000
```

### Step 2 — Connect the STM32

Connect the STM32 to the Windows computer through USB.

Check the assigned Virtual COM Port. For example:

```python
PORT = "COM3"
```

Change `COM3` if a different port is assigned to the STM32.

### Step 3 — Start the Python Serial Reader

Run:

```bash
python Sensor/read_sensor.py
```

The Python application will:

1. Connect to the STM32 Virtual COM Port.
2. Read the illumination value.
3. Convert the received value into a numerical value.
4. Encode the value as JSON.
5. Send the measurement to the Node.js server through WebSocket.

### Step 4 — Open the web interface

Open the following address in a browser:

```text
http://localhost:3000
```

The received measurements should appear on the web interface and the real-time graph.

## Remote Access with ngrok

To allow other devices to access the web interface, the local Node.js server can be exposed using ngrok.

With the Node.js server running on port 3000:

```bash
ngrok http 3000
```

ngrok provides a public URL that can be shared with other clients.

## Data Flow

The complete data flow is:

```text
BH1750
   │
   │ I²C
   ▼
STM32
   │
   │ USB Virtual COM
   ▼
Python
   │
   │ WebSocket
   ▼
Node.js Server
   │
   │ WebSocket Broadcast
   ▼
Browser
   │
   ├── Current Lux Value
   ├── Timestamp
   └── Real-Time Plotly Graph
```

## Example Data

The Python application sends the measured lux value as a JSON number:

```json
123.45
```

The Node.js server validates the received value and broadcasts it to connected browser clients.

The frontend then parses the JSON value and updates the graph and current-reading panel.

## Project Documentation

A detailed description of the sensor, hardware architecture, software architecture, communication protocol, implementation, experimental results, and discussion is provided in the project report.

## Authors

**Computer Network Group Project**

Vietnamese-German University (VGU)

## License

This project was developed for academic and educational purposes.
