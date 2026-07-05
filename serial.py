"""
DOCUMENTATION

Serial port configuration: 
Configures a Virtual COM Port connection (USB CDC) using the pySerial library. Parameters include 9600 baud rate, 8 data bits, no parity, 1 stop bit, and a 1-second timeout. Note: For native USB CDC, the hardware often ignores baud rate and transmits at USB speed, but the parameter is still required by pySerial.

Data parsing logic: 
Reads raw bytes ending in a newline (\\n) character from the serial buffer. The data is decoded using UTF-8 and stripped of whitespace. It then splits the string to remove the "LUX: " prefix and casts the remaining text to a float.

Expected input/output format: 
Input: Raw UART byte strings formatted with a prefix (e.g., b'LUX: 123.45\\n'). 
Output: A JSON-ready structured string (e.g., {"sensor": "BH1750", "lux": 123.45}).

Runtime behavior: 
The script runs in an infinite while loop to capture data at approximately 1Hz. It includes robust error handling to gracefully catch corrupted strings or hardware disconnections, attempting to reconnect every 2 seconds if the USB cable is unplugged.
"""

import serial
import time
import json

# Replace 'COM3' with the Virtual COM Port assigned to the STM32 (Check Device Manager)
PORT = 'COM3'
BAUD_RATE = 9600

def main():
    ser = None
    
    while True:
        try:
            # 1. OPEN THE VIRTUAL COM PORT
            if ser is None or not ser.is_open:
                print(f"Attempting to connect to STM32 on {PORT}...")
                ser = serial.Serial(
                    port=PORT,
                    baudrate=BAUD_RATE,
                    parity=serial.PARITY_NONE,
                    stopbits=serial.STOPBITS_ONE,
                    bytesize=serial.EIGHTBITS,
                    timeout=1 
                )
                print(f"Successfully connected! Listening for data...")

            # 2. READ THE DATA 
            # readline() automatically looks for the '\n' character your friend is sending
            raw_bytes = ser.readline()

            if not raw_bytes:
                continue

            # 3. PARSE AND DECODE
            clean_text = raw_bytes.decode('utf-8').strip()

            if not clean_text:
                continue

            # 4. EXTRACT THE NUMBER FROM "LUX: 123.45"
            # We convert it to uppercase just in case he types "Lux:" or "lux:"
            if "LUX:" in clean_text.upper():
                # Split the string at the colon. 
                # ["LUX", " 123.45"] -> grab index 1 -> strip spaces -> "123.45"
                number_string = clean_text.upper().split(":")[1].strip()
                lux_value = float(number_string)
            else:
                print(f"WARNING: Unrecognized format. Expected 'LUX: [number]', got: '{clean_text}'")
                continue

            # 5. ENCAPSULATE INTO JSON
            payload = {
                "sensor": "BH1750",
                "lux": lux_value
            }
            json_output = json.dumps(payload)

            # 6. OUTPUT FOR SERVER
            print(f"Transmitting: {json_output}")

        # 7. ERROR HANDLING
        except serial.SerialException as e:
            print(f"CRITICAL: USB Cable unplugged or connection lost. {e}")
            if ser:
                ser.close()
            ser = None
            print("Retrying in 2 seconds...")
            time.sleep(2)
            
        except UnicodeDecodeError:
            print("WARNING: Received corrupted electrical bytes. Ignoring.")
            
        except ValueError:
            print(f"WARNING: Could not convert the extracted text to a number. Text was: '{clean_text}'")
            
        except Exception as e:
            print(f"UNKNOWN ERROR: {e}")
            time.sleep(1)

if __name__ == "__main__":
    main()