# BH1750 - Light Intensity Sensor
BH1750 Light Intensity Sensor is chosen as the hardware input device for the system, accompanying with a **STM32 micro-controller**. The BH1750 is a digital ambient light sensor capable of measuring luminance (in lux) with high precision and low noise. It communicates via I²C and provides stable readings suitable for periodic sampling at 1 Hz.

Sensor readings will be stable and consistent under:
* Low‑light conditions
* Normal indoor lighting
* Bright light exposure

# Features
* The output format must be clearly defined (e.g., **"LUX: 123.45"**), ensuring compatibility with the UART data stream.
* The sensor will transmit its readings through UART to the host machine without data corruption or unexpected delays.
