
from pymongo import MongoClient

client = MongoClient('mongodb://localhost:27017/')
db = client['civicare_db']
users = db['users']

emails = ["admin@civicare.com", "henilpatel0107@gmail.com"]

print("--- Account Role Verification ---")
for email in emails:
    user = users.find_one({"email": email})
    if user:
        print(f"User: {user.get('username')}")
        print(f"  Email: {user.get('email')}")
        print(f"  Role: {user.get('role')}")
    else:
        print(f"Email {email}: NOT FOUND")
print("---------------------------------")
