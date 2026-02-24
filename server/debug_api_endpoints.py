
import requests
import json

BASE_URL = "http://localhost:5000"

def login():
    url = f"{BASE_URL}/api/auth/login"
    payload = {
        "email": "henilpatel0107@gmail.com",
        "password": "123456"
    }
    try:
        res = requests.post(url, json=payload)
        if res.status_code == 200:
            print("[LOGIN] Success")
            return res.json().get('token')
        else:
            print(f"[LOGIN] Failed: {res.status_code} - {res.text}")
            return None
    except Exception as e:
        print(f"[LOGIN] Exception: {e}")
        return None

def check_endpoint(name, url, token):
    headers = {'Authorization': f'Bearer {token}'}
    try:
        res = requests.get(url, headers=headers)
        if res.status_code == 200:
            print(f"[{name}] Success: {res.text[:100]}...")
            return True
        else:
            print(f"[{name}] Failed: {res.status_code} - {res.text}")
            return False
    except Exception as e:
        print(f"[{name}] Exception: {e}")
        return False

if __name__ == "__main__":
    token = login()
    if token:
        check_endpoint("STATS", f"{BASE_URL}/api/admin/stats", token)
        check_endpoint("ANALYTICS", f"{BASE_URL}/api/admin/analytics", token)
        check_endpoint("NOTIFICATIONS", f"{BASE_URL}/api/notifications", token)
