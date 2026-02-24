from pymongo import MongoClient
from werkzeug.security import generate_password_hash
from datetime import datetime
import os

# Configuration
MONGO_URI = os.environ.get('MONGO_URI', 'mongodb://localhost:27017/civicare_db')

try:
    client = MongoClient(MONGO_URI)
    db = client.civicare_db
    print(f"Connected to {MONGO_URI}")
except Exception as e:
    print(f"Error connecting: {e}")
    exit(1)

# Clear Collections
db.users.delete_many({})
db.teams.delete_many({})
db.complaints.delete_many({})
db.notifications.delete_many({})

print("Cleared existing data.")

# --- Users ---
users = []

# Admin
admin = {
    "username": "Admin User",
    "email": "admin@civicare.com",
    "password_hash": generate_password_hash("admin123"),
    "role": "admin",
    "ward": "Central",
    "is_verified": True,
    "created_at": datetime.utcnow()
}
admin_id = db.users.insert_one(admin).inserted_id
users.append(admin)
print("Created Admin.")

# Supervisors
supervisors_data = [
    ("Road Supervisor", "road_sup@civicare.com", "Roads"),
    ("Water Supervisor", "water_sup@civicare.com", "Water"),
    ("Electric Supervisor", "elec_sup@civicare.com", "Electricity"),
    ("Sanitation Supervisor", "sanitation_sup@civicare.com", "Sanitation"),
]
supervisors = {} 

for name, email, specialization in supervisors_data:
    user = {
        "username": name,
        "email": email,
        "password_hash": generate_password_hash("password123"),
        "role": "supervisor",
        "ward": "Ward 1",
        "created_at": datetime.utcnow()
    }
    res = db.users.insert_one(user)
    supervisors[specialization] = res.inserted_id
print(f"Created {len(supervisors)} Supervisors.")

# Field Staff
staff_ids = []
for i in range(5):
    import random
    specs = ['Roads', 'Water', 'Electricity', 'Sanitation']
    user = {
        "username": f"Field Officer {i+1}",
        "email": f"staff{i+1}@civicare.com",
        "password_hash": generate_password_hash("password123"),
        "role": "staff",
        "ward": f"Ward {i%3 + 1}",
        "phone": "555-0100",
        "specialization": random.choice(specs),
        "created_at": datetime.utcnow()
    }
    res = db.users.insert_one(user)
    staff_ids.append(res.inserted_id)

print(f"Created {len(staff_ids)} Staff Members.")

# Citizen
citizen = {
    "username": "John Citizen",
    "email": "citizen@gmail.com",
    "password_hash": generate_password_hash("password123"),
    "role": "citizen",
    "phone": "999-888-777",
    "created_at": datetime.utcnow()
}
citizen_id = db.users.insert_one(citizen).inserted_id
print("Created Citizen.")

# --- Teams ---
teams_data = [
    ("Alpha Road Squad", "Roads"),
    ("Aqua Force", "Water"),
    ("Power Grid Unit", "Electricity")
]

for name, cat in teams_data:
    if cat in supervisors:
        team = {
            "name": name,
            "supervisor_id": str(supervisors[cat]),
            "members": [str(sid) for sid in staff_ids[:2]], # Assign first 2 staff keys
            "specialization": cat,
            "created_at": datetime.utcnow()
        }
        db.teams.insert_one(team)
print("Created Operational Teams.")

# --- Complaints ---
complaints_data = [
    {
        "title": "Huge Pothole on Main St",
        "description": "A very large pothole causing traffic slowdowns near the market.",
        "category": "Roads",
        "priority": "High"
    },
    {
        "title": "Leaking Pipe in Park",
        "description": "Water is spraying everywhere in the central park.",
        "category": "Water",
        "priority": "Medium"
    },
    {
        "title": "Street Light Broken",
        "description": "Light post #45 is flickering and dark at night.",
        "category": "Electricity",
        "priority": "Low"
    },
     {
        "title": "Garbage Dump Overflow",
        "description": "Trash hasn't been collected in 3 days.",
        "category": "Sanitation",
        "priority": "High"
    }
]

for c in complaints_data:
    complaint = {
        "user_id": str(citizen_id),
        "title": c['title'],
        "description": c['description'],
        "category": c['category'],
        "priority": c['priority'],
        "status": "Pending",
        "location_address": "123 Civic Ward",
        "timeline": [{'status': 'Created', 'date': datetime.utcnow(), 'note': 'Complaint registered'}],
        "created_at": datetime.utcnow()
    }
    db.complaints.insert_one(complaint)

print("Created Sample Complaints.")
print("Database Seeding Complete! 🚀")
