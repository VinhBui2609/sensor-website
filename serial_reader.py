"""
===========================================================================
DOCUMENTATION

Serial port configuration: 
Configures a Virtual COM Port connection (USB CDC) using the pySerial library. Parameters include 9600 baud rate, 8 data bits, no parity, 1 stop bit, and a 1-second timeout. 

Expected UART Input:
    123.45

Returned Data (JSON String):
    {"type": "sensor", "sensor": "BH1750", "lux": 123.45}
===========================================================================
"""

import serial
import time
import json

# ========================= Configuration ========================= #

# Replace 'COM3' with the Virtual COM Port assigned to the STM32
PORT = "COM3"         

BAUD_RATE = 9600
TIMEOUT = 1

# ========================= Serial Functions ========================= #

def connect_serial():
    """
    Open the STM32 Virtual COM Port.
    Returns a Serial object.
    """
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

def parse_sensor_data(raw_bytes):
    """
    Convert raw UART bytes into a Python dictionary.

    Input:
        b'123.45\\n'

    Output:
        {
            "type": "sensor",
            "sensor": "BH1750",
            "lux": 123.45
        }

    Returns None if the packet is invalid.
    """
    try:
        text = raw_bytes.decode("utf-8").strip()

        if not text:
            return None

        # Directly cast to float since the hardware removed the "LUX:" prefix
        value = float(text)

        payload = {
            "type": "sensor",
            "sensor": "BH1750",
            "lux": value
        }

        return payload

    except UnicodeDecodeError:
        print("WARNING: UTF-8 decoding failed.")
        return None

    except ValueError:
        print(f"WARNING: Invalid numeric value received: '{text}'")
        return None


def read_sensor(ser):
    """
    Read one UART packet.

    Returns:
        dict  -> valid sensor data
        None  -> invalid packet
    """
    raw_bytes = ser.readline()

    if not raw_bytes:
        return None

    return parse_sensor_data(raw_bytes)


# ========================= Main Program ========================= #

def main():
    ser = None

    while True:
        try:
            # 1. Check and maintain the serial connection
            if ser is None or not ser.is_open:
                ser = connect_serial()

            # 2. Read and parse the data
            payload = read_sensor(ser)

            # 3. Output as a JSON string for the Node.js server
            if payload is not None:
                json_output = json.dumps(payload)
                print(json_output)

        except serial.SerialException as e:
            print(f"Serial Error: {e}")
            if ser is not None:
                ser.close()
            ser = None
            print("Retrying in 2 seconds...")
            time.sleep(2)

        except KeyboardInterrupt:
            # Safely close the port when the user presses Ctrl+C
            print("\nProgram terminated.")
            if ser is not None and ser.is_open:
                ser.close()
            break

        except Exception as e:
            print(f"Unexpected Error: {e}")
            time.sleep(1)


# ========================= Entry Point ========================= #

if __name__ == "__main__":
    main()