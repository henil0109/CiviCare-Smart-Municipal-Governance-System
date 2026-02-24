
from pymongo import MongoClient
from bson import ObjectId

client = MongoClient('mongodb://localhost:27017/')
db = client['civicare_db']
complaints = db['complaints']
users = db['users']

# Find target user "DHONI" (henilpatel0107@gmail.com)
target_user = users.find_one({"email": "henilpatel0107@gmail.com"})
if not target_user:
    print("FATAL: Target User DHONI not found.")
    exit(1)

target_id = str(target_user['_id'])
print(f"Target User found: {target_user['username']} ({target_id})")

# IDs of orphan complaints found previously
bad_ids = [
    ObjectId("69766d0488dd78879d00f738"),
    ObjectId("69766d0488dd78879d00f739"),
    ObjectId("69766d0488dd78879d00f73a"),
    ObjectId("69766d0488dd78879d00f73b")
]

result = complaints.update_many(
    {"_id": {"$in": bad_ids}},
    {"$set": {"user_id": target_id}}
)

print(f"Update Complete. Reassigned {result.modified_count} complaints to DHONI.")
