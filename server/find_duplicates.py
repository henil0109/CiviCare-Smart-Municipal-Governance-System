
from pymongo import MongoClient
import pymongo

client = MongoClient('mongodb://localhost:27017/')
db = client['civicare_db']
users = db['users']

pipeline = [
    {"$group": {
        "_id": "$email",
        "count": {"$sum": 1},
        "ids": {"$push": "$_id"},
        "usernames": {"$push": "$username"}
    }},
    {"$match": {"count": {"$gt": 1}}}
]

duplicates = list(users.aggregate(pipeline))

print(f"Found {len(duplicates)} duplicate groups.")
deleted_total = 0

for d in duplicates:
    print(f"Resolving: {d['_id']}")
    # Sort IDs (ObjectId contains timestamp, so sort ensures order)
    # Actually, plain sort works on ObjectId. Smallest is oldest.
    ids = sorted(d['ids'])
    
    # Keep the first one (oldest)
    keep_id = ids[0]
    remove_ids = ids[1:]
    
    print(f"  Keeping: {keep_id}")
    print(f"  Removing: {remove_ids}")
    
    res = users.delete_many({"_id": {"$in": remove_ids}})
    deleted_total += res.deleted_count

print("-" * 20)
print(f"Cleanup Complete. Removed {deleted_total} duplicate users.")

# Apply Unique Index
print("Applying Unique Index on 'email'...")
try:
    users.create_index("email", unique=True)
    print("Unique Index Created Successfully!")
except Exception as e:
    print(f"Failed to create index: {e}")
