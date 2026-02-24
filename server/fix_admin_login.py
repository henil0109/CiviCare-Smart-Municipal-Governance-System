from pymongo import MongoClient
import os

MONGO_URI = os.environ.get('MONGO_URI', 'mongodb://localhost:27017/civicare_db')

try:
    client = MongoClient(MONGO_URI)
    db = client.civicare_db
    users = db.users
    
    result = users.update_one(
        {"email": "admin@civicare.com"},
        {"$set": {"is_verified": True}}
    )
    
    if result.matched_count > 0:
        print(f"Admin updated. Modified count: {result.modified_count}")
    else:
        print("Admin user not found.")
        
except Exception as e:
    print(f"Error: {e}")
