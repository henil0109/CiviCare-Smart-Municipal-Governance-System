
from pymongo import MongoClient

client = MongoClient('mongodb://localhost:27017/')
db = client['civicare_db']
users = db['users']

# Check for both emails we saw earlier
emails = ["henilpatel0107@gmail.com", "henilpatel0101@gmail.com"]

print("--- User Status Check ---")
for email in emails:
    user = users.find_one({"email": email})
    if user:
        print(f"User Found: {user.get('username')}")
        print(f"  Email: {user.get('email')}")
        print(f"  Role: {user.get('role')}")
        print(f"  ID: {user.get('_id')}")
    else:
        print(f"User {email}: NOT FOUND")
print("-------------------------")
