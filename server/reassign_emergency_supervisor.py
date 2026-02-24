from pymongo import MongoClient
import os

# Connect to MongoDB
client = MongoClient('mongodb://localhost:27017/')
db = client['civicare_db']
users_collection = db['users']
teams_collection = db['teams']

def reassign_supervisor(username):
    print(f"Searching for supervisor: {username}...")
    supervisor = users_collection.find_one({"username": username})
    
    if not supervisor:
        print(f"Error: User '{username}' not found.")
        return

    print(f"Found Supervisor: {supervisor['username']} ({supervisor['email']})")
    supervisor_id = str(supervisor['_id'])

    # Find all Emergency Teams
    emergency_teams = teams_collection.find({"specialization": {"$regex": "^Emergency -"}})
    
    count = 0
    for team in emergency_teams:
        teams_collection.update_one(
            {"_id": team['_id']},
            {"$set": {"supervisor_id": supervisor_id}}
        )
        print(f"Updated Team: {team['name']} -> Assigned to {supervisor['username']}")
        count += 1
        
    print(f"\nSuccessfully reassigned {count} Emergency Teams to {supervisor['username']}.")

if __name__ == "__main__":
    reassign_supervisor("MS Dhoni")
