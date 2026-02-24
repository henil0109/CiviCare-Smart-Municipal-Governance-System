from pymongo import MongoClient
import os

MONGO_URI = 'mongodb://localhost:27017/civicare_db'
client = MongoClient(MONGO_URI)
db = client.civicare_db
users = db.users

# Find all users with XP > 0
rich_users = list(users.find({"xp": {"$gt": 0}}))

print(f"Found {len(rich_users)} users with XP:")
for u in rich_users:
    print(f"- {u['username']} ({u['email']}): {u.get('xp', 0)} XP")
