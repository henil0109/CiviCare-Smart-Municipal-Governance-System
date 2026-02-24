
from pymongo import MongoClient

client = MongoClient('mongodb://localhost:27017/')
db = client['civicare_db']
users = db['users']

email = "henilpatel0107@gmail.com"
result = users.update_one(
    {"email": email},
    {"$set": {"role": "admin"}}
)

print(f"Matched: {result.matched_count}, Modified: {result.modified_count}")
if result.matched_count > 0:
    print(f"User {email} is now an ADMIN.")
else:
    print(f"User {email} not found.")
