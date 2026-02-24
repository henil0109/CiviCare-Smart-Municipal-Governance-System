"""
seed_supervisors.py
--------------------
Removes ALL existing supervisors and seeds 10 fresh ones (Indian cricket legends)
grouped into 5 shared wards by related domain pairs:

  Ward A  →  Roads & Infrastructure  +  Traffic & Road Safety
  Ward B  →  Water Supply & Plumbing  +  Drainage & Sewage
  Ward C  →  Sanitation & Waste Mgmt  +  Noise & Environmental
  Ward D  →  Electricity & Street Lighting  +  Fire Safety & Emergency
  Ward E  →  Parks & Public Spaces  +  Building & Construction
"""

from pymongo import MongoClient
from werkzeug.security import generate_password_hash
from datetime import datetime
import os

MONGO_URI = os.environ.get('MONGO_URI', 'mongodb://localhost:27017/civicare_db')
client = MongoClient(MONGO_URI)
db = client.civicare_db
NOW = datetime.utcnow()

# ── Step 1: Remove all existing supervisors ───────────────────────────────────
result = db.users.delete_many({"role": "supervisor"})
print(f"[REMOVED] {result.deleted_count} existing supervisor(s) deleted.")

# ── Step 2: Define supervisors ────────────────────────────────────────────────
supervisors = [
    # Ward A: Roads & Transport
    {
        "username": "Rohit Sharma",
        "email": "rohit@civicare.com",
        "password": "Rohit@123",
        "specialization": "Roads & Infrastructure",
        "phone": "+91-98201-21001",
        "address": "25, Marine Lines, Mumbai - 400002",
        "ward": "Ward A",
        "id_number": "SUP-RD-001",
        "bio": "Veteran infrastructure supervisor with 12+ years overseeing road development and highway projects across Maharashtra.",
    },
    {
        "username": "Rishabh Pant",
        "email": "rishabh@civicare.com",
        "password": "Rishabh@123",
        "specialization": "Traffic & Road Safety",
        "phone": "+91-98201-21009",
        "address": "16, Haridwar Road, Roorkee - 247667",
        "ward": "Ward A",
        "id_number": "SUP-TR-002",
        "bio": "Energetic traffic and road safety coordinator managing signal automation, pedestrian safety upgrades, and road signage compliance.",
    },
    # Ward B: Water & Drainage
    {
        "username": "Virat Kohli",
        "email": "virat@civicare.com",
        "password": "Virat@123",
        "specialization": "Water Supply & Plumbing",
        "phone": "+91-98201-21002",
        "address": "8, Civil Lines, Delhi - 110054",
        "ward": "Ward B",
        "id_number": "SUP-WS-003",
        "bio": "High-performing operations head specializing in water distribution networks, emergency pipeline repair, and supply chain management.",
    },
    {
        "username": "Jasprit Bumrah",
        "email": "jasprit@civicare.com",
        "password": "Jasprit@123",
        "specialization": "Drainage & Sewage",
        "phone": "+91-98201-21007",
        "address": "9, Satellite Road, Ahmedabad - 380015",
        "ward": "Ward B",
        "id_number": "SUP-DR-004",
        "bio": "Precision-focused supervisor known for rapid stormwater drain clearing, sewage overflow control, and flood preparedness planning.",
    },
    # Ward C: Sanitation & Environment
    {
        "username": "Sachin Tendulkar",
        "email": "sachin@civicare.com",
        "password": "Sachin@123",
        "specialization": "Sanitation & Waste Management",
        "phone": "+91-98201-21004",
        "address": "3, Sahitya Sahawas, Bandra, Mumbai - 400050",
        "ward": "Ward C",
        "id_number": "SUP-SN-005",
        "bio": "Legendary civic supervisor who transformed public sanitation standards across the city with zero-waste initiatives and community engagement.",
    },
    {
        "username": "KL Rahul",
        "email": "kl@civicare.com",
        "password": "Kl@123",
        "specialization": "Noise & Environmental",
        "phone": "+91-98201-21010",
        "address": "5, Mangalore Road, Bengaluru - 560001",
        "ward": "Ward C",
        "id_number": "SUP-EP-006",
        "bio": "Measured and methodical supervisor leading noise pollution monitoring, environmental compliance audits, and green protocol enforcement.",
    },
    # Ward D: Utilities & Emergency
    {
        "username": "Shubman Gill",
        "email": "shubman@civicare.com",
        "password": "Shubman@123",
        "specialization": "Electricity & Street Lighting",
        "phone": "+91-98201-21006",
        "address": "14, Sector 12, Chandigarh - 160012",
        "ward": "Ward D",
        "id_number": "SUP-EL-007",
        "bio": "Young, tech-driven supervisor heading smart streetlighting, EV charging infrastructure, and transformer maintenance operations.",
    },
    {
        "username": "MS Dhoni",
        "email": "ms@civicare.com",
        "password": "Ms@123",
        "specialization": "Fire Safety & Emergency",
        "phone": "+91-98201-21003",
        "address": "11, Circular Road, Ranchi - 834001",
        "ward": "Ward D",
        "id_number": "SUP-FS-008",
        "bio": "Cool-headed emergency response commander with extensive experience in disaster management, rapid deployment, and crisis control.",
    },
    # Ward E: Public Spaces & Construction
    {
        "username": "Ravindra Jadeja",
        "email": "ravindra@civicare.com",
        "password": "Ravindra@123",
        "specialization": "Parks & Public Spaces",
        "phone": "+91-98201-21005",
        "address": "7, Navlakhi, Jamnagar - 361001",
        "ward": "Ward E",
        "id_number": "SUP-PK-009",
        "bio": "An all-rounder supervisor managing green belt development, tree plantation drives, playground restoration, and public space beautification.",
    },
    {
        "username": "Hardik Pandya",
        "email": "hardik@civicare.com",
        "password": "Hardik@123",
        "specialization": "Building & Construction",
        "phone": "+91-98201-21008",
        "address": "21, Vadodara Road, Surat - 395003",
        "ward": "Ward E",
        "id_number": "SUP-BC-010",
        "bio": "Dynamic civil engineering supervisor overseeing illegal construction investigations, structural audits, and building safety demolitions.",
    },
]

# ── Step 3: Insert supervisors ────────────────────────────────────────────────
inserted = []
for sup in supervisors:
    doc = {
        "username":           sup["username"],
        "email":              sup["email"],
        "password_hash":      generate_password_hash(sup["password"]),
        "role":               "supervisor",
        "phone":              sup["phone"],
        "address":            sup["address"],
        "ward":               sup["ward"],
        "specialization":     sup["specialization"],
        "id_number":          sup["id_number"],
        "bio":                sup.get("bio", ""),
        "is_verified":        True,
        "verification_token": "",
        "xp":                 0,
        "level":              1,
        "badges":             [],
        "impact_score":       0,
        "created_at":         NOW,
    }
    db.users.insert_one(doc)
    inserted.append(sup["username"])
    print(f"  [OK] {sup['username']:<22} | {sup['ward']} | {sup['email']:<28} | {sup['password']}")

print(f"\n{'='*80}")
print(f"  Done! {len(inserted)} supervisor(s) seeded.")
print(f"{'='*80}\n")
print(f"  {'Ward':<8} {'Name':<22} {'Domain':<35} {'Email'}")
print("-" * 95)
for sup in supervisors:
    print(f"  {sup['ward']:<8} {sup['username']:<22} {sup['specialization']:<35} {sup['email']}")
