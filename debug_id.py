import requests
import json

BASE_URL = 'http://localhost:5000'

def run():
    # 1. Login
    print("Logging in...")
    try:
        res = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "admin@civicare.gov",
            "password": "admin"
        })
        if res.status_code != 200:
            print("Login failed:", res.text)
            return
        
        token = res.json()['token']
        headers = {'Authorization': f'Bearer {token}'}
        print("Login success.")

        # 2. List All Complaints
        print("\nFetching all complaints...")
        res = requests.get(f"{BASE_URL}/api/complaints", headers=headers)
        if res.status_code != 200:
            print("Failed to list complaints:", res.text)
            return
            
        complaints = res.json()
        ids = [c['_id'] for c in complaints]
        print(f"Found {len(ids)} complaints.")
        print("IDs in DB:", ids)
        
        target_id = "69766d0488dd78879d00f73a"
        if target_id in ids:
            print(f"\nTarget ID {target_id} FOUND in list.")
        else:
            print(f"\nTarget ID {target_id} NOT FOUND in list.")

        # 3. Fetch Specific ID
        print(f"\nFetching specific details for {target_id}...")
        res = requests.get(f"{BASE_URL}/api/complaints/{target_id}", headers=headers)
        print(f"Status Code: {res.status_code}")
        print("Response:", res.text)

    except Exception as e:
        print("Error:", e)

if __name__ == "__main__":
    run()
