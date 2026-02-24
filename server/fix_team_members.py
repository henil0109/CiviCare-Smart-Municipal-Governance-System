
from pymongo import MongoClient
import os
from bson import ObjectId

MONGO_URI = os.environ.get('MONGO_URI', 'mongodb://localhost:27017/civicare_db')

def fix_members():
    try:
        client = MongoClient(MONGO_URI)
        db = client.civicare_db
        
        print("Connected to MongoDB")
        
        # 1. Find Supervisor "Ms Dhoni"
        supervisor = db.users.find_one({"username": "MS Dhoni"})
        if not supervisor:
            print("Error: 'MS Dhoni' supervisor not found.")
            return

        supervisor_id = str(supervisor['_id'])
        print(f"Found Supervisor: {supervisor['username']} ({supervisor_id})")
        
        # 2. Find All Field Officers (Role: staff)
        officers = list(db.users.find({"role": "staff"}))
        print(f"Found {len(officers)} Field Officers.")
        
        # Helper to get IDs of officers by specialization
        def get_officers_by_spec(spec_keyword):
            return [str(u['_id']) for u in officers if spec_keyword.lower() in u.get('specialization', '').lower()]

        # 3. Find Teams managed by Ms Dhoni
        teams = list(db.teams.find({"supervisor_id": supervisor_id}))
        print(f"Found {len(teams)} teams managed by Ms Dhoni.")
        
        # 4. Map and Update
        updates_count = 0
        
        for team in teams:
            team_spec = team.get('specialization', '')
            team_name = team.get('name', '')
            member_ids = []
            
            # Logic to pick members
            if "Sanitation" in team_spec:
                member_ids = get_officers_by_spec("Sanitation")
            elif "Electricity" in team_spec or "Power" in team_name:
                member_ids = get_officers_by_spec("Electricity")
            elif "Water" in team_spec:
                member_ids = get_officers_by_spec("Water")
            elif "Road" in team_spec or "Roads" in team_name:
                member_ids = get_officers_by_spec("Roads")
            
            # Fallback for Fire, Traffic, or if no specific specialists found
            # Assign mixed group if empty, to ensure "0 members" is fixed.
            if not member_ids:
                print(f"  > No specialists found for {team_name} ({team_spec}). Assigning available officers...")
                # Assign first 3 officers as backup/general unit
                member_ids = [str(u['_id']) for u in officers[:3]]
            
            # Update Team
            if member_ids:
                db.teams.update_one(
                    {"_id": team['_id']},
                    {"$set": {"members": member_ids}}
                )
                print(f"  [FIXED] Team '{team_name}': Assigned {len(member_ids)} members.")
                updates_count += 1
            else:
                print(f"  [WARNING] Could not find any members to assign to '{team_name}'.")

        print(f"\nCompleted. Updated {updates_count} teams.")

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    fix_members()
