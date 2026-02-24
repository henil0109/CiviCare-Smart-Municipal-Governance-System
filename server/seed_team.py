from pymongo import MongoClient
from werkzeug.security import generate_password_hash
from bson import ObjectId
import datetime

client = MongoClient('mongodb://localhost:27017/')
db = client.civicare_db
users = db.users
teams = db.teams

# 1. Get Supervisor ID
supervisor = users.find_one({"email": "supervisor@civic.com"})
if not supervisor:
    print("Supervisor not found! Run app first.")
    exit()

sup_id = str(supervisor['_id'])

# 2. Create Staff Members
staff_members = [
    {"name": "Rahul Field", "email": "rahul@civic.com", "role": "staff", "spec": "Roads"},
    {"name": "Priya Tech", "email": "priya@civic.com", "role": "staff", "spec": "Electricity"},
    {"name": "Amit Water", "email": "amit@civic.com", "role": "staff", "spec": "Water"}
]

member_ids = []

for s in staff_members:
    existing = users.find_one({"email": s['email']})
    if not existing:
        res = users.insert_one({
            "username": s['name'],
            "email": s['email'],
            "password_hash": generate_password_hash("password123"),
            "role": "staff",
            "specialization": s['spec'],
            "created_at": datetime.datetime.utcnow()
        })
        member_ids.append(str(res.inserted_id))
        print(f"Created staff: {s['name']}")
    else:
        member_ids.append(str(existing['_id']))
        print(f"Staff exists: {s['name']}")

# 3. Create Team
team_name = "Alpha Squad (Roads)"
if not teams.find_one({"name": team_name}):
    teams.insert_one({
        "name": team_name,
        "supervisor_id": sup_id,
        "members": member_ids,
        "specialization": "Roads",
        "created_at": datetime.datetime.utcnow()
    })
    print(f"Created Team: {team_name}")
else:
    print(f"Team {team_name} already exists.")

print("\nSeeding Complete! Supervisor now has a team.")
