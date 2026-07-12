# Python Serial Reader
A Python‑based Serial Reader responsible for acquiring sensor data from the UART interface on the local machine[cite: 2]. The task includes installing Python and the required libraries, configuring the serial port parameters, and implementing a reliable data‑reading loop using the pySerial package[cite: 2]. The Serial Reader must parse incoming UART messages, validate the data, and prepare it for transmission to the Node.js server through the real‑time communication layer[cite: 2].

The Python Serial Reader acts as the hardware‑facing component of the system architecture[cite: 2]. It abstracts low‑level UART communication and ensures that sensor readings are captured at a frequency of 1 Hz[cite: 2]. This component is essential for feeding structured data into the **WebSocket Communication Layer** and ultimately enabling real‑time visualization in the GUI[cite: 2].

# Features
* The Serial Reader must successfully open the designated UART port with correct parameters (baud rate, parity, stop bits, timeout)[cite: 2].
* The system must read sensor data at a frequency of approximately 1 Hz (1sec)[cite: 2].
* The Serial Reader encapsulates each reading into a structured format (e.g., JSON‑ready dictionary or string)[cite: 2].
* The Serial Reader runs continuously without unexpected termination during testing[cite: 2].

# Overview

## Serial port configuration
Configures a Virtual COM Port connection (USB CDC) to the STM32 micro-controller using the `pySerial` library. The parameters are explicitly defined as 9600 baud rate, 8 data bits, no parity, 1 stop bit, and a 1-second timeout. The timeout parameter acts as a failsafe, ensuring the script does not freeze indefinitely if the hardware delays transmission.

## Data parsing logic
Reads raw byte streams from the serial buffer. Because the data arrives as raw machine bytes, it is first decoded using UTF-8 and stripped of hidden characters (such as the `\n` termination character). The clean text is then directly cast to a float to mathematically validate the sensor reading before encapsulation.

## Expected input/output format
* **Input:** Raw UART byte strings containing a single numerical float (e.g., `b'123.45\n'`).
* **Output:** A standardized JSON string package formatted for the downstream Node.js server, including the required data type flag (e.g., `{"type": "sensor", "sensor": "BH1750", "lux": 123.45}`).

## Runtime behavior
The module operates continuously inside an infinite `while True:` loop to passively listen for incoming data at a frequency of 1Hz. It utilizes a modular, clean architecture with robust error handling to guarantee crash-proof execution:
* **Hardware Disconnections:** Catches `serial.SerialException` if the USB is unplugged, safely unbinds the port, and automatically attempts to reconnect every 2 seconds.
* **Data Corruption:** Catches `UnicodeDecodeError` and `ValueError` to gracefully ignore electrical line noise or corrupted packets without terminating the loop.
* **Graceful Shutdown:** Utilizes a `KeyboardInterrupt` block to intercept manual termination commands (Ctrl+C), ensuring the COM port is safely closed and returned to the operating system before the script exits.
