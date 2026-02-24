"""
purge_db.py
-----------
Permanently deletes:
  1. All complaints (complaints collection)
  2. All citizen/user accounts (role = 'user' or 'citizen')
  3. All custom teams (teams collection)
  4. All reports (reports collection)
  5. Any emergency_teams, emergency_dispatches, etc.

Preserves: admins, supervisors, field_officers.
"""

from pymongo import MongoClient
import os

MONGO_URI = os.environ.get('MONGO_URI', 'mongodb://localhost:27017/civicare_db')
client = MongoClient(MONGO_URI)
db = client.civicare_db

print("\n" + "="*65)
print("  CiviCare DB Purge — Complaints / Citizens / Teams / Reports")
print("="*65 + "\n")

# ── 1. Complaints ─────────────────────────────────────────────────────────────
r = db.complaints.delete_many({})
print(f"  [COMPLAINTS]      Deleted {r.deleted_count} document(s)")

# ── 2. Citizens (regular users) ───────────────────────────────────────────────
r = db.users.delete_many({"role": {"$in": ["user", "citizen"]}})
print(f"  [CITIZENS]        Deleted {r.deleted_count} document(s)")

# ── 3. Custom teams ───────────────────────────────────────────────────────────
r = db.teams.delete_many({})
print(f"  [TEAMS]           Deleted {r.deleted_count} document(s)")

# ── 4. Reports ────────────────────────────────────────────────────────────────
r = db.reports.delete_many({})
print(f"  [REPORTS]         Deleted {r.deleted_count} document(s)")

# ── 5. Emergency teams / dispatches (related to complaints) ───────────────────
r = db.emergency_teams.delete_many({})
print(f"  [EMERGENCY_TEAMS] Deleted {r.deleted_count} document(s)")

r = db.emergency_dispatches.delete_many({})
print(f"  [DISPATCHES]      Deleted {r.deleted_count} document(s)")

# ── 6. Notifications ─────────────────────────────────────────────────────────
r = db.notifications.delete_many({})
print(f"  [NOTIFICATIONS]   Deleted {r.deleted_count} document(s)")

# ── Summary ───────────────────────────────────────────────────────────────────
print("\n" + "="*65)
print("  Done! Preserved: admins, supervisors, field_officers.")
print("="*65 + "\n")

# Show what's left
print("  Remaining users by role:")
for role in ["admin", "supervisor", "field_officer"]:
    count = db.users.count_documents({"role": role})
    print(f"    {role:<18} {count} account(s)")

# List all non-empty collections still in DB
print("\n  Remaining non-empty collections:")
for name in db.list_collection_names():
    count = db[name].count_documents({})
    if count > 0:
        print(f"    {name:<25} {count} doc(s)")
print()
