"""
seed_field_officers.py
-----------------------
Removes ALL existing field officers (role = 'field_officer' or 'staff')
and seeds 10 fresh ones. Field officers are NOT assigned to wards —
they are deployed based on domain expertise and complaint category.
"""

from pymongo import MongoClient
from werkzeug.security import generate_password_hash
from datetime import datetime
import os

MONGO_URI = os.environ.get('MONGO_URI', 'mongodb://localhost:27017/civicare_db')
client = MongoClient(MONGO_URI)
db = client.civicare_db

DEFAULT_PASSWORD = "CiviCare@2024"
NOW = datetime.utcnow()

# ── Step 1: Remove all existing field officers ────────────────────────────────
result = db.users.delete_many({"role": {"$in": ["field_officer", "staff"]}})
print(f"[REMOVED] {result.deleted_count} existing field officer(s) deleted.")

# ── Step 2: Define 10 new field officers (NO ward) ────────────────────────────
field_officers = [
    {
        "username": "Arjun Mehta",
        "email": "arjun.mehta@civicare.com",
        "specialization": "Roads & Infrastructure",
        "phone": "+91-98201-11001",
        "address": "12, Shivaji Nagar, Pune - 411005",
        "id_number": "FO-RD-001",
        "bio": "10+ years experience in road repair, pothole patching, and asphalt resurfacing.",
    },
    {
        "username": "Priya Desai",
        "email": "priya.desai@civicare.com",
        "specialization": "Water Supply & Plumbing",
        "phone": "+91-98201-11002",
        "address": "34, Baner Road, Pune - 411045",
        "id_number": "FO-WS-002",
        "bio": "Certified plumbing technician with expertise in pipeline repairs and water leak detection.",
    },
    {
        "username": "Rajan Kulkarni",
        "email": "rajan.kulkarni@civicare.com",
        "specialization": "Electricity & Street Lighting",
        "phone": "+91-98201-11003",
        "address": "7, Deccan Gymkhana, Pune - 411004",
        "id_number": "FO-EL-003",
        "bio": "Licensed electrician specializing in streetlight maintenance, transformer faults, and power line repairs.",
    },
    {
        "username": "Sunita Rane",
        "email": "sunita.rane@civicare.com",
        "specialization": "Sanitation & Waste Management",
        "phone": "+91-98201-11004",
        "address": "22, Katraj, Pune - 411046",
        "id_number": "FO-SN-004",
        "bio": "Expert in solid waste management, drainage cleaning, and public sanitation protocols.",
    },
    {
        "username": "Deepak Pawar",
        "email": "deepak.pawar@civicare.com",
        "specialization": "Drainage & Sewage",
        "phone": "+91-98201-11005",
        "address": "5, Hadapsar, Pune - 411028",
        "id_number": "FO-DR-005",
        "bio": "Specializes in sewer line inspections, drain unblocking, and stormwater overflow management.",
    },
    {
        "username": "Kavita Joshi",
        "email": "kavita.joshi@civicare.com",
        "specialization": "Parks & Public Spaces",
        "phone": "+91-98201-11006",
        "address": "18, Kothrud, Pune - 411038",
        "id_number": "FO-PK-006",
        "bio": "Horticulture graduate managing public park maintenance, tree trimming, and garden restoration.",
    },
    {
        "username": "Amit Shinde",
        "email": "amit.shinde@civicare.com",
        "specialization": "Building & Construction Complaints",
        "phone": "+91-98201-11007",
        "address": "3, Yerawada, Pune - 411006",
        "id_number": "FO-BC-007",
        "bio": "Civil engineer handling illegal construction reports, structural safety assessments, and demolition orders.",
    },
    {
        "username": "Neha Patil",
        "email": "neha.patil@civicare.com",
        "specialization": "Noise & Environmental Pollution",
        "phone": "+91-98201-11008",
        "address": "9, Aundh, Pune - 411007",
        "id_number": "FO-EP-008",
        "bio": "Environment officer trained in noise level monitoring, air quality checks, and pollution complaint resolution.",
    },
    {
        "username": "Suresh Gaikwad",
        "email": "suresh.gaikwad@civicare.com",
        "specialization": "Fire Safety & Emergency Response",
        "phone": "+91-98201-11009",
        "address": "41, Bibwewadi, Pune - 411037",
        "id_number": "FO-FS-009",
        "bio": "Trained fire safety officer with experience in fire prevention audits, emergency coordination, and rescue operations.",
    },
    {
        "username": "Anita Bhosale",
        "email": "anita.bhosale@civicare.com",
        "specialization": "Traffic & Road Safety",
        "phone": "+91-98201-11010",
        "address": "15, Viman Nagar, Pune - 411014",
        "id_number": "FO-TR-010",
        "bio": "Traffic safety expert managing broken signals, road signage, speed bumps, and pedestrian crossing complaints.",
    },
]

# ── Step 3: Insert new officers (no ward field) ───────────────────────────────
pw_hash = generate_password_hash(DEFAULT_PASSWORD)
inserted = []
for fo in field_officers:
    doc = {
        "username":           fo["username"],
        "email":              fo["email"],
        "password_hash":      pw_hash,
        "role":               "field_officer",
        "phone":              fo["phone"],
        "address":            fo["address"],
        "specialization":     fo["specialization"],
        "id_number":          fo["id_number"],
        "bio":                fo.get("bio", ""),
        "is_verified":        True,
        "verification_token": "",
        "xp":                 0,
        "level":              1,
        "badges":             [],
        "impact_score":       0,
        "created_at":         NOW,
    }
    db.users.insert_one(doc)
    inserted.append(fo["username"])
    print(f"  [OK] {fo['username']:<22}  |  {fo['email']:<35}  |  {fo['specialization']}")

print(f"\n{'='*70}")
print(f"  Done! {len(inserted)} field officer(s) seeded (no ward assigned).")
print(f"  Default password: {DEFAULT_PASSWORD}")
print(f"{'='*70}\n")

# Also clear any stale ward field from existing field officers in DB
db.users.update_many({"role": "field_officer"}, {"$unset": {"ward": ""}})
print("[CLEANED] Removed 'ward' field from all field officers in DB.")
