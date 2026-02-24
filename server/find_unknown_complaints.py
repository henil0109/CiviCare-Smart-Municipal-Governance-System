
from pymongo import MongoClient
from bson import ObjectId

client = MongoClient('mongodb://localhost:27017/')
db = client['civicare_db']
complaints = db['complaints']
users = db['users']

print("Checking for orphaned complaints (User ID points to nowhere)...")
all_complaints = complaints.find({})
orphans = []

for c in all_complaints:
    uid = c.get('user_id')
    if not uid:
        orphans.append(c)
        continue
        
    try:
        # User IDs in this system seem to be stored as strings in complaints usually
        user = users.find_one({"_id": ObjectId(uid)})
        if not user:
            orphans.append(c)
    except:
        orphans.append(c)

print(f"Found {len(orphans)} orphaned complaints.")
for c in orphans:
    print(f"ID: {c.get('_id')} | Title: {c.get('title')} | Bad UserID: {c.get('user_id')}")
