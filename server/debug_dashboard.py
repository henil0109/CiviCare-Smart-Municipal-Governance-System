
import os
from pymongo import MongoClient
import datetime
from bson import ObjectId

# Setup connection (assuming default local)
client = MongoClient('mongodb://localhost:27017/')
db = client['civicare_db']
complaints = db['complaints']
users = db['users']

print(f"Connected to DB. Complaints count: {complaints.count_documents({})}")

# 1. Test Solvers Pipeline
pipeline_solvers = [
    {"$match": {"status": "Resolved"}},
    {"$addFields": {
        "supervisor_obj_id": {
            "$convert": {
                "input": "$assigned_supervisor",
                "to": "objectId",
                "onError": None,
                "onNull": None
            }
        }
    }},
    {"$lookup": {
        "from": "users",
        "localField": "supervisor_obj_id",
        "foreignField": "_id",
        "as": "supervisor_details"
    }},
    {"$unwind": {"path": "$supervisor_details", "preserveNullAndEmptyArrays": False}},
    {"$group": {
        "_id": "$supervisor_details.username",
        "role": {"$first": "$supervisor_details.role"},
        "count": {"$sum": 1},
        "avg_days": {"$avg": "$resolution_report.days_taken"}
    }},
    {"$sort": {"count": -1}},
    {"$limit": 3}
]

print("\n--- Testing Solvers Pipeline ---")
try:
    res = list(complaints.aggregate(pipeline_solvers))
    print("Success:", res)
except Exception as e:
    print("FAILED:", e)

# 2. Test Dept Pipeline
pipeline_dept = [
    {"$group": {
        "_id": "$category",
        "total": {"$sum": 1},
        "pending": {
            "$sum": {
                "$cond": [{"$in": ["$status", ["Pending", "In Progress", "Pending Verification"]]}, 1, 0]
            }
        }
    }},
    {"$project": {
        "category": "$_id",
        "total": 1,
        "pending": 1,
        "load_percentage": {
            "$multiply": [{"$divide": ["$pending", "$total"]}, 100]
        }
    }},
    {"$sort": {"load_percentage": -1}}
]
print("\n--- Testing Dept Pipeline ---")
try:
    res = list(complaints.aggregate(pipeline_dept))
    print("Success:", res)
except Exception as e:
    print("FAILED:", e)

# 3. Test Activity Pipeline
pipeline_activity = [
    {"$project": {"timeline": 1, "title": 1, "_id": 1}},
    {"$unwind": "$timeline"},
    {"$sort": {"timeline.date": -1}},
    {"$limit": 7}
]
print("\n--- Testing Activity Pipeline ---")
try:
    res = list(complaints.aggregate(pipeline_activity))
    print("Success:", res)
except Exception as e:
    print("FAILED:", e)
