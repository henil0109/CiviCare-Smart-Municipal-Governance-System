from pymongo import MongoClient
import os
from werkzeug.security import generate_password_hash
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.environ.get('MONGO_URI', 'mongodb://localhost:27017/civicare_db')
client = MongoClient(MONGO_URI)
db = client.civicare_db

email = "henilpatel0107@gmail.com"
new_pass = "123456"

print(f"Resetting password for {email}...")

# 1. Update Password
hashed_password = generate_password_hash(new_pass)
result = db.users.update_one(
    {"email": email},
    {"$set": {"password_hash": hashed_password}}
)

if result.modified_count > 0:
    print(f"BINGO! Password reset to '{new_pass}'")
else:
    # Check if user exists
    user = db.users.find_one({"email": email})
    if user:
        print("User found, but password not updated (maybe it was already same?)")
    else:
        print("User NOT found!")
