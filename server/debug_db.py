from pymongo import MongoClient
import os
from dotenv import load_dotenv
import pprint

load_dotenv()

MONGO_URI = os.environ.get('MONGO_URI', 'mongodb://localhost:27017/civicare_db')
client = MongoClient(MONGO_URI)
db = client.civicare_db

email = "henilpatel0107@gmail.com"

print(f"--- Searching for User: {email} ---")
user = db.users.find_one({"email": email})
if user:
    print(f"User Found: ID={user['_id']}, Role={user.get('role')}")
    user_id_str = str(user['_id'])
    
    print(f"\n--- Searching for Complaints (user_id={user_id_str}) ---")
    complaints = list(db.complaints.find({"user_id": user_id_str}))
    print(f"Found {len(complaints)} complaints.")
    for c in complaints:
        print(f" - {c.get('title')} (Status: {c.get('status')})")
        
    print("\n--- All Complaints in DB (First 5) ---")
    all_complaints = list(db.complaints.find().limit(5))
    for c in all_complaints:
       print(f" - [User: {c.get('user_id')}] {c.get('title')}")

else:
    print("User not found.")
