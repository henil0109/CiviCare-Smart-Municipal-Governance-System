import requests
import os

# Create a dummy file
with open('test_upload.txt', 'w') as f:
    f.write('This is a test upload file.')

url = 'http://127.0.0.1:5000/api/upload'
files = {'file': open('test_upload.txt', 'rb')}

try:
    response = requests.post(url, files=files)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error: {e}")
finally:
    files['file'].close()
    if os.path.exists('test_upload.txt'):
        os.remove('test_upload.txt')
