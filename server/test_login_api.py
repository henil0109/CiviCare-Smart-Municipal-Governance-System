import urllib.request
import json
import urllib.error

url = "http://localhost:5000/api/auth/login"
payload = {
    "email": "henilpatel0107@gmail.com",
    "password": "123456"
}
data = json.dumps(payload).encode('utf-8')

req = urllib.request.Request(url, data=data, headers={'Content-Type': 'application/json'})

try:
    print(f"Sending POST to {url}...")
    with urllib.request.urlopen(req) as response:
        print(f"Status Code: {response.getcode()}")
        print("Response Body:")
        print(response.read().decode('utf-8'))
except urllib.error.HTTPError as e:
    print(f"HTTP Error: {e.code}")
    print(f"Reason: {e.read().decode('utf-8')}")
except Exception as e:
    print(f"Request failed: {e}")
