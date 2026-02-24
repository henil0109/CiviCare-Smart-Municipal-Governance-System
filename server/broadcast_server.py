import os
import socket
import re
import subprocess
import sys

def get_local_ip():
    try:
        # Connect to a public DNS to determine the best local IP (doesn't actually send data)
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        local_ip = s.getsockname()[0]
        s.close()
        return local_ip
    except Exception:
        return "127.0.0.1"

def update_env_file(local_ip):
    env_path = '.env'
    if not os.path.exists(env_path):
        print("Error: .env file not found!")
        return

    with open(env_path, 'r') as f:
        lines = f.readlines()

    new_lines = []
    client_url_updated = False
    
    # regex to match CLIENT_URL=...
    # We want to replace "CLIENT_URL=http://...:5173"
    
    for line in lines:
        if line.strip().startswith('CLIENT_URL='):
            # Preserve the port, assume 5173
            new_lines.append(f"CLIENT_URL=http://{local_ip}:5173\n")
            client_url_updated = True
        else:
            new_lines.append(line)
            
    if not client_url_updated:
        # If not found, append it
        new_lines.append(f"\nCLIENT_URL=http://{local_ip}:5173\n")

    with open(env_path, 'w') as f:
        f.writelines(new_lines)
    
    print(f"✅ Updated CLIENT_URL to http://{local_ip}:5173 in .env")

def main():
    print("--- CiviCare Auto-Config ---")
    
    # 1. Get Local IP
    ip = get_local_ip()
    print(f"📡 Detected Local IP: {ip}")
    
    # 2. Update .env
    update_env_file(ip)
    
    # 3. Start Flask Server
    print("🚀 Starting Flask Server...")
    print("--------------------------------")
    
    # Use the current python interpreter to run app.py
    # We use subprocess.call to allow it to take over
    try:
        cmd = [sys.executable, "app.py"]
        subprocess.run(cmd)
    except KeyboardInterrupt:
        print("\n🛑 Server stopped.")

if __name__ == "__main__":
    main()
