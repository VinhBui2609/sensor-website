# Python Serial Reader
A Python‑based Serial Reader responsible for acquiring sensor data from the UART interface on the local machine. The task includes installing Python and the required libraries, configuring the serial port parameters, and implementing a reliable data‑reading loop using the pySerial package. The Serial Reader must parse incoming UART messages, validate the data, and prepare it for transmission to the Node.js server through the real‑time communication layer.

The Python Serial Reader acts as the hardware‑facing component of the system architecture. It abstracts low‑level UART communication and ensures that sensor readings are captured at a frequency of 1 Hz. This component is essential for feeding structured data into the **WebSocket Communication Layer** and ultimately enabling real‑time visualization in the GUI.

# Features
* The Serial Reader must successfully open the designated UART port with correct parameters (baud rate, parity, stop bits, timeout).
* The system must read sensor data at a frequency of approximately 1 Hz (1sec).
* The Serial Reader encapsulates each reading into a structured format (e.g., JSON‑ready dictionary or string).
* The Serial Reader runs continuously without unexpected termination during testing.
