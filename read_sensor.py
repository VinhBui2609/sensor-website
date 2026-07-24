"""
BH1750 Serial Reader -> WebSocket producer

"""

import serial
import time
import json

import websocket

PORT = "COM3"
BAUD_RATE = 9600
TIMEOUT = 1
WS_URL = "ws://localhost:3000/"


def connect_serial():
    print(f"Connecting to {PORT}...")

    ser = serial.Serial(
        port=PORT,
        baudrate=BAUD_RATE,
        parity=serial.PARITY_NONE,
        stopbits=serial.STOPBITS_ONE,
        bytesize=serial.EIGHTBITS,
        timeout=TIMEOUT
    )

    print("STM32 connected.")
    return ser


def into_json(raw_bytes):
    try:
        text = raw_bytes.decode("utf-8").strip()

        if not text:
            return None

        value = float(text)
        return value

    except UnicodeDecodeError:
        print("WARNING: UTF-8 decoding failed.")
        return None

    except ValueError:
        print(f"WARNING: Invalid numeric value received: '{text}'")
        return None



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
                ser = connect_serial()
            
            if ws is None or not ws.connected:
                ws = open_websocket()

            lux = ser.readline()
            payload = into_json(lux)

            if lux is not None:
                json_output = json.dumps(payload)
                ws.send(json_output)

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

        except KeyboardInterrupt:
            if ser is not None and ser.is_open:
                ser.close()
            if ws is not None:
                ws.close()
            print("\nProgram stopped.")
            break


if __name__ == "__main__":
    main()
