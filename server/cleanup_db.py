"""
cleanup_db.py
---
Removes:
  - All users with role NOT in ['admin', 'supervisor']
  - All complaints
  - All notifications
  - All teams

Keeps:
  - Admin and Supervisor accounts (unchanged)
"""

import os
from pymongo import MongoClient

MONGO_URI = os.environ.get("MONGO_URI", "mongodb://localhost:27017/civicare_db")

client = MongoClient(MONGO_URI)
db = client.civicare_db

KEEP_ROLES = {"admin", "supervisor"}

# ── 1. Delete regular users ──────────────────────────────────────────────────
users_result = db.users.delete_many({"role": {"$nin": list(KEEP_ROLES)}})
print(f"[users]         Deleted {users_result.deleted_count} regular users")

# ── 2. Delete all complaints ──────────────────────────────────────────────────
complaints_result = db.complaints.delete_many({})
print(f"[complaints]    Deleted {complaints_result.deleted_count} complaints")

# ── 3. Delete all notifications ───────────────────────────────────────────────
notif_result = db.notifications.delete_many({})
print(f"[notifications] Deleted {notif_result.deleted_count} notifications")

# ── 4. Delete all teams ───────────────────────────────────────────────────────
teams_result = db.teams.delete_many({})
print(f"[teams]         Deleted {teams_result.deleted_count} teams")

# ── 5. Summary of who remains ─────────────────────────────────────────────────
remaining = list(db.users.find({}, {"username": 1, "email": 1, "role": 1, "_id": 0}))
print(f"\n✅ Done. {len(remaining)} account(s) remain in the database:\n")
for u in remaining:
    print(f"   [{u['role'].upper()}]  {u['username']}  <{u['email']}>")
