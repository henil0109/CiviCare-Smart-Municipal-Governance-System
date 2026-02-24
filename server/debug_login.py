from pymongo import MongoClient
import os
from werkzeug.security import check_password_hash, generate_password_hash
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.environ.get('MONGO_URI', 'mongodb://localhost:27017/civicare_db')
client = MongoClient(MONGO_URI)
db = client.civicare_db

email = "henilpatel0107@gmail.com"
password_attempt = "123456"

print(f"--- Debugging Login for {email} ---")
user = db.users.find_one({"email": email})

if not user:
    print("[FAIL] User NOT FOUND in DB")
else:
    print(f"[OK] User FOUND: ID={user['_id']}")
    print(f"   Stored Hash: {user.get('password_hash')}")
    print(f"   Is Verified: {user.get('is_verified')}")
    
    # Check Password
    is_valid = check_password_hash(user['password_hash'], password_attempt)
    if is_valid:
        print(f"[OK] Password '{password_attempt}' MATCHES hash.")
    else:
        print(f"[FAIL] Password '{password_attempt}' DOES NOT MATCH hash.")
        
        # Test Generation
        new_hash = generate_password_hash(password_attempt)
        print(f"   Generating fresh hash for '123456': {new_hash}")
        print(f"   Does fresh hash match? {check_password_hash(new_hash, password_attempt)}")
        
        # Check stripping
        stripped_stored = user['password_hash'].strip()
        print(f"   Does strip match? {check_password_hash(stripped_stored, password_attempt)}")
