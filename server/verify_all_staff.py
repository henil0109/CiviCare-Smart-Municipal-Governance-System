from pymongo import MongoClient
import certifi
import os

MONGO_URI = os.environ.get('MONGO_URI', 'mongodb+srv://henil_db_user:CiviCare%40123@cluster0.e3whqzb.mongodb.net/civicare_db?appName=Cluster0')
client = MongoClient(MONGO_URI, tlsCAFile=certifi.where())
db = client.civicare_db

# Verify all non-citizen users
result = db.users.update_many(
    {"role": {"$in": ["supervisor", "staff", "field_officer", "admin"]}},
    {"$set": {"is_verified": True}}
)
print(f"Updated {result.modified_count} users -> is_verified=True")

# Show results
users = list(db.users.find(
    {"role": {"$ne": "citizen"}},
    {"username": 1, "email": 1, "role": 1, "is_verified": 1}
))
print(f"\n{'Role':<15} {'Name':<25} {'Email':<35} Verified")
print("-" * 85)
for u in users:
    print(f"  {u['role']:<13} {u['username']:<25} {u['email']:<35} {u.get('is_verified', False)}")

print(f"\nDone! All staff can now log in.")
