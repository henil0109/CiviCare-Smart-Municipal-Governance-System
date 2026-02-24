from pymongo import MongoClient

client = MongoClient('mongodb://localhost:27017/')
db = client.civicare_db
users = db.users

print(f"{'USERNAME':<20} | {'EMAIL':<30} | {'ROLE':<15} | {'PASSWORD SET'}")
print("-" * 80)

supervisors = users.find({"role": "supervisor"})
count = 0
for s in supervisors:
    has_pw = "YES" if s.get('password_hash') else "NO"
    print(f"{s.get('username', 'N/A'):<20} | {s.get('email', 'N/A'):<30} | {s.get('role'):<15} | {has_pw}")
    count += 1

if count == 0:
    print("No supervisors found.")
else:
    print(f"\nTotal Supervisors: {count}")
