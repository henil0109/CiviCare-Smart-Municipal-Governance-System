import os
from pymongo import MongoClient
from bson import ObjectId

MONGO_URI = os.environ.get('MONGO_URI', 'mongodb://localhost:27017/civicare_db')

def check():
    client = MongoClient(MONGO_URI)
    db = client.civicare_db
    collection = db.complaints
    
    target_id = "69766d0488dd78879d00f73a"
    
    print(f"Checking for ID: {target_id}")
    
    try:
        oid = ObjectId(target_id)
        doc = collection.find_one({"_id": oid})
        
        if doc:
            print("FOUND!")
            print("Title:", doc.get('title'))
            print("Status:", doc.get('status'))
        else:
            print("NOT FOUND in DB.")
            
    except Exception as e:
        print(f"Invalid ID format: {e}")

    print("\nListing last 5 complaints:")
    for c in collection.find().sort('_id', -1).limit(5):
        print(f"ID: {c['_id']} | Title: {c.get('title')}")

if __name__ == "__main__":
    check()
