"""
BH1750 Serial Reader -> WebSocket producer

Do not name this file serial.py because that can shadow the
installed pySerial package named "serial".
"""

import json
import time

import serial
import websocket

PORT = "COM3"
BAUD_RATE = 9600
WS_URL = "ws://localhost:3000/?role=producer"


def open_websocket():
    while True:
        try:
            print(f"Connecting to WebSocket server at {WS_URL}...")
            ws = websocket.create_connection(WS_URL, timeout=5)
            print("WebSocket connected.")
            return ws
        except (OSError, websocket.WebSocketException) as error:
            print(f"WebSocket connection failed: {error}")
            time.sleep(2)


def main():
    ser = None
    ws = None

    while True:
        try:
            if ser is None or not ser.is_open:
                print(f"Connecting to STM32 on {PORT}...")
                ser = serial.Serial(
                    port=PORT,
                    baudrate=BAUD_RATE,
                    parity=serial.PARITY_NONE,
                    stopbits=serial.STOPBITS_ONE,
                    bytesize=serial.EIGHTBITS,
                    timeout=1,
                )
                print("Serial port connected.")

            if ws is None or not ws.connected:
                ws = open_websocket()

            raw_bytes = ser.readline()
            if not raw_bytes:
                continue

            clean_text = raw_bytes.decode("utf-8").strip()
            if not clean_text:
                continue

            if "LUX:" not in clean_text.upper():
                print(f"WARNING: Unexpected input: {clean_text!r}")
                continue

            number_string = clean_text.split(":", 1)[1].strip()
            lux_value = float(number_string)

            payload = {
                "sensor": "BH1750",
                "lux": lux_value,
            }

            json_output = json.dumps(payload)
            ws.send(json_output)
            print(f"Sent through WebSocket: {json_output}")

        except serial.SerialException as error:
            print(f"Serial connection lost: {error}")
            if ser is not None:
                ser.close()
            ser = None
            time.sleep(2)

        except (websocket.WebSocketException, OSError) as error:
            print(f"WebSocket connection lost: {error}")
            if ws is not None:
                try:
                    ws.close()
                except Exception:
                    pass
            ws = None
            time.sleep(2)

        except UnicodeDecodeError:
            print("WARNING: Corrupted serial bytes were ignored.")

        except ValueError:
            print("WARNING: Lux value could not be converted to a number.")

        except KeyboardInterrupt:
            if ser is not None and ser.is_open:
                ser.close()
            if ws is not None:
                ws.close()
            print("\nProgram stopped.")
            break


if __name__ == "__main__":
    main()
