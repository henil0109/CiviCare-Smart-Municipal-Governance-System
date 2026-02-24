from pymongo import MongoClient

client = MongoClient('mongodb://localhost:27017/')
db = client.civicare_db
users = db.users

# Update all supervisors to be verified
result = users.update_many(
    {"role": "supervisor"},
    {"$set": {"is_verified": True}}
)

print(f"Matched {result.matched_count} supervisors.")
print(f"Modified {result.modified_count} supervisors to be verified.")

# Check Raghav specifically
raghav = users.find_one({"email": "raghav@gmail.com"})
if raghav:
    print(f"raghav@gmail.com verified status: {raghav.get('is_verified')}")
else:
    print("raghav@gmail.com not found!")
