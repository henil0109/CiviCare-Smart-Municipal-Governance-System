from pymongo import MongoClient

MONGO_URI = 'mongodb://localhost:27017/civicare_db'
client = MongoClient(MONGO_URI)
db = client.civicare_db

# Reset XP and Level for all users
result = db.users.update_many(
    {}, 
    {"$set": {"xp": 0, "level": 1, "impact_score": 0}}
)

print(f"Reset XP for {result.modified_count} users.")
