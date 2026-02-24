"""
update_supervisor_emails.py
Updates all supervisor email domains to @civicare.com
"""
from pymongo import MongoClient

db = MongoClient('mongodb://localhost:27017/civicare_db').civicare_db

supervisors = list(db.users.find({'role': 'supervisor'}, {'username': 1, 'email': 1}))

print("Updating supervisor emails:\n")
for sup in supervisors:
    old_email = sup['email']
    local_part = old_email.split('@')[0]
    new_email = f"{local_part}@civicare.com"

    db.users.update_one(
        {'_id': sup['_id']},
        {'$set': {'email': new_email}}
    )
    print(f"  {sup['username']}: {old_email}  ->  {new_email}")

print(f"\nDone. Updated {len(supervisors)} supervisor(s).")
