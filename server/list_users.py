
from pymongo import MongoClient
import os

MONGO_URI = os.environ.get('MONGO_URI', 'mongodb://localhost:27017/civicare_db')

try:
    client = MongoClient(MONGO_URI)
    db = client.civicare_db
    users = db.users.find({}, {"username": 1, "role": 1, "specialization": 1})
    
    print(f"{'Username':<20} | {'Role':<15} | {'Specialization'}")
    print("-" * 60)
    for user in users:
        print(f"{user.get('username', 'N/A'):<20} | {user.get('role', 'N/A'):<15} | {user.get('specialization', 'N/A')}")

except Exception as e:
    print(f"Error: {e}")
