import urllib.request
import json

url = "http://127.0.0.1:5000/api/auth/login"
data = {
    "email": "admin@civicare.com",
    "password": "admin123"
}

headers = {'Content-Type': 'application/json'}
req = urllib.request.Request(url, data=json.dumps(data).encode('utf-8'), headers=headers)

try:
    with urllib.request.urlopen(req) as response:
        print(f"Status Code: {response.getcode()}")
        print(f"Response: {response.read().decode('utf-8')}")
        if response.getcode() == 200:
            print("Login Successful!")
        else:
            print("Login Failed!")
except urllib.error.HTTPError as e:
    print(f"HTTP Error: {e.code}")
    print(f"Response: {e.read().decode('utf-8')}")
except Exception as e:
    print(f"Error: {e}")
