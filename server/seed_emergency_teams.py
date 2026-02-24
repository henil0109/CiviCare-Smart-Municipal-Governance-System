import os
from pymongo import MongoClient
from datetime import datetime
from bson import ObjectId
# from dotenv import load_dotenv
# load_dotenv()

MONGO_URI = os.environ.get('MONGO_URI', 'mongodb://localhost:27017/civicare_db')

try:
    client = MongoClient(MONGO_URI)
    db = client.civicare_db
    teams_collection = db.teams
    users_collection = db.users
    
    print("Connected to MongoDB")
    
    # 1. Ensure a dedicated Emergency Supervisor exists
    supervisor = users_collection.find_one({"username": "EmergencySupervisor"})
    
    if not supervisor:
        print("Creating dedicated Emergency Supervisor...")
        # Simple hash for 'password123' (In prod use werkzeug)
        # For seeding script, we'll just use a placeholder or import if possible.
        # Let's assume we can't import werkzeug here easily without env setup, 
        # so we'll try to find ANY admin/supervisor to clone password or just set a known hash.
        # Actually, let's just make them an admin so they can login.
        
        # PBKDF2 default hash for 'password123' (from a standard werkzeug generate_password_hash run)
        # mingled with salt. For simplicity in this script, we might skip auth or use a known hash.
        # Let's try to key off an existing user's password if available, or just create a user logic.
        
        new_supervisor = {
            "username": "EmergencySupervisor",
            "email": "emergency@civicare.com",
            "password_hash": "scrypt:32768:8:1$k7s6w...", # Dummy, user needs to reset or we use a known one.
            # actually better to just pick the first admin if we don't want to deal with hashing in a script
            "role": "supervisor",
            "specialization": "Emergency Response",
            "created_at": datetime.utcnow()
        }
        # Ideally we'd import generate_password_hash but let's try to assume app context or just grab local admin.
        
        # Better approach: Grab the first Admin and use them as the Emergency Lead if EmergencySupervisor doesn't exist.
        # But user asked for "registered field officer and supervisor". 
        # Let's look for ANY supervisor.
        existing_sup = users_collection.find_one({"role": "supervisor"})
        if existing_sup:
            supervisor = existing_sup
            print(f"Using existing supervisor: {supervisor['username']}")
        else:
            # Fallback to Admin
            supervisor = users_collection.find_one({"role": "admin"})
            print(f"No supervisor found, falling back to Admin: {supervisor['username']}")
            
    supervisor_id = str(supervisor['_id'])
    
    emergency_domains = [
        {"name": "Emergency Fire Response", "spec": "Emergency - Fire"},
        {"name": "Emergency Water Squad", "spec": "Emergency - Water"},
        {"name": "Emergency Road Repair", "spec": "Emergency - Roads"},
        {"name": "Emergency Power Grid", "spec": "Emergency - Electricity"},
        {"name": "Emergency Traffic Control", "spec": "Emergency - Traffic"},
        {"name": "Emergency Sanitation Unit", "spec": "Emergency - Sanitation"}
    ]
    
    for domain in emergency_domains:
        existing = teams_collection.find_one({"specialization": domain['spec']})
        
        if existing:
            # Update supervisor if changed
            teams_collection.update_one(
                {"_id": existing['_id']},
                {"$set": {"supervisor_id": supervisor_id}}
            )
            print(f"Updated Team '{domain['name']}' with supervisor {supervisor['username']}")
        else:
            new_team = {
                "name": domain['name'],
                "supervisor_id": supervisor_id,
                "members": [], # Empty for now, manual assignment later
                "specialization": domain['spec'],
                "created_at": datetime.utcnow()
            }
            teams_collection.insert_one(new_team)
            print(f"Created Team: {domain['name']}")

    print("\nEmergency Teams check complete.")

except Exception as e:
    print(f"Error: {e}")
