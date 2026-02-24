from pymongo import MongoClient
from werkzeug.security import generate_password_hash
import datetime

# Connection
client = MongoClient('mongodb://localhost:27017/')
db = client.civicare_db
users = db.users

# Test Data
email = "supervisor@civic.com"
password = "password123"

# Check if exists
if users.find_one({"email": email}):
    print(f"User {email} already exists. Updating password...")
    users.update_one(
        {"email": email},
        {"$set": {
            "password_hash": generate_password_hash(password),
            "role": "supervisor",
            "username": "Supervisor Demo"
        }}
    )
else:
    print(f"Creating new user {email}...")
    users.insert_one({
        "username": "Supervisor Demo",
        "email": email,
        "password_hash": generate_password_hash(password),
        "role": "supervisor",
        "created_at": datetime.datetime.utcnow()
    })

print(f"\nSUCCESS: Supervisor credentials ready.")
print(f"Email: {email}")
print(f"Password: {password}")
