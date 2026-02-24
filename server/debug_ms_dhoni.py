from pymongo import MongoClient
from bson import ObjectId

client = MongoClient('mongodb://localhost:27017/')
db = client['civicare_db']

def check_ms_dhoni_stats():
    # 1. Find MS Dhoni
    dhoni = db.users.find_one({"username": "MS Dhoni"})
    if not dhoni:
        print("User MS Dhoni not found!")
        return

    print(f"Supervisor: {dhoni['username']} (ID: {dhoni['_id']})")
    
    # 2. Find Teams managed by him
    teams = list(db.teams.find({"supervisor_id": str(dhoni['_id'])}))
    team_ids = [str(t['_id']) for t in teams]
    print(f"Managed Teams ({len(teams)}):")
    for t in teams:
        members = t.get('members', [])
        print(f"  - {t['name']}: {len(members)} members ({members})")

    # 3. Find Active Complaints
    # Logic matches 'active operations' usually = In Progress + Pending? or just In Progress?
    # Let's check generally what's assigned.
    
    query = {
        "$or": [
            {"assigned_supervisor": str(dhoni['_id'])},
            {"assigned_team": {"$in": team_ids}}
        ]
    }
    
    complaints = list(db.complaints.find(query))
    print(f"\nTotal Associated Complaints Found: {len(complaints)}")
    
    for c in complaints:
        print(f"- [{c.get('status')}] {c.get('title')} (ID: {c['_id']})")
        print(f"  Category: {c.get('category')}")
        print(f"  Assigned Team: {c.get('assigned_team')}")
        print(f"  Assigned Supervisor: {c.get('assigned_supervisor')}")
        print("---")

if __name__ == "__main__":
    check_ms_dhoni_stats()
