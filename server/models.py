from datetime import datetime
import json
from bson import ObjectId

class JSONEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, ObjectId):
            return str(o)
        if isinstance(o, datetime):
            return o.isoformat()
        return json.JSONEncoder.default(self, o)

class User:
    def __init__(self, username, email, password_hash, role='citizen', phone='', address='', ward='', profile_photo='', specialization='General', id_number='', is_verified=False, verification_token=''):
        self.username = username
        self.email = email
        self.password_hash = password_hash
        self.role = role  # 'citizen' or 'admin'
        self.phone = phone
        self.address = address
        self.ward = ward
        self.profile_photo = profile_photo
        self.specialization = specialization
        self.id_number = id_number  # Aadhaar / Voter ID
        self.is_verified = is_verified
        self.verification_token = verification_token
        
        # Gamification Fields
        self.xp = 0
        self.level = 1
        self.badges = []
        self.impact_score = 0
        
        self.created_at = datetime.utcnow()

    def to_dict(self):
        return {
            "username": self.username,
            "email": self.email,
            "password_hash": self.password_hash,
            "role": self.role,
            "phone": self.phone,
            "address": self.address,
            "ward": self.ward,
            "profile_photo": self.profile_photo,
            "specialization": self.specialization,
            "id_number": getattr(self, 'id_number', ''),
            "is_verified": getattr(self, 'is_verified', False),
            "verification_token": getattr(self, 'verification_token', ''),
            
            # Gamification
            "xp": getattr(self, 'xp', 0),
            "level": getattr(self, 'level', 1),
            "badges": getattr(self, 'badges', []),
            "impact_score": getattr(self, 'impact_score', 0),
            
            "created_at": self.created_at
        }

class Complaint:
    def __init__(self, user_id, title, description, category, priority='Medium', status='Pending', 
                 contact_phone='', location_address='', ward='', proof_url='', photo_url=''):
        self.user_id = user_id
        self.title = title
        self.description = description
        self.category = category
        self.priority = priority  # 'High', 'Medium', 'Low'
        self.status = status      # 'Pending', 'In Progress', 'Resolved'
        
        # New fields
        self.contact_phone = contact_phone
        self.location_address = location_address
        self.ward = ward
        self.proof_url = proof_url
        self.photo_url = photo_url
        
        # Admin fields
        self.admin_remarks = []
        self.assigned_team = None # Legacy (Single User)
        self.assigned_supervisor = None
        self.assigned_unit = None # New (Team Object)
        
        # Advanced fields
        self.deadline = None
        self.work_log = []
        self.timeline = [{'status': 'Created', 'date': datetime.utcnow(), 'note': 'Complaint registered'}]
        self.timeline = [{'status': 'Created', 'date': datetime.utcnow(), 'note': 'Complaint registered'}]
        self.ai_analysis = {}
        self.resolution_report = {} # New: Stores final report data

        self.created_at = datetime.utcnow()
        self.updates = []

    def to_dict(self):
        return {
            "user_id": self.user_id,
            "title": self.title,
            "description": self.description,
            "category": self.category,
            "priority": self.priority,
            "status": self.status,
            "contact_phone": self.contact_phone,
            "location_address": self.location_address,
            "ward": self.ward,
            "proof_url": self.proof_url,
            "photo_url": self.photo_url,
            "admin_remarks": self.admin_remarks,
            "assigned_team": self.assigned_team,
            "assigned_supervisor": self.assigned_supervisor,
            "assigned_unit": self.assigned_unit,
            "deadline": self.deadline,
            "work_log": self.work_log,
            "timeline": self.timeline,
            "timeline": self.timeline,
            "ai_analysis": self.ai_analysis,
            "resolution_report": self.resolution_report,
            "created_at": self.created_at,
            "updates": self.updates
        }
class Team:
    def __init__(self, name, supervisor_id, members=None, specialization='General'):
        self.name = name
        self.supervisor_id = supervisor_id # ObjectId string
        self.members = members if members else [] # List of ObjectId strings
        self.specialization = specialization
        self.created_at = datetime.utcnow()

    def to_dict(self):
        return {
            "name": self.name,
            "supervisor_id": self.supervisor_id,
            "members": self.members,
            "specialization": self.specialization,
            "created_at": self.created_at
        }

class Notification:
    def __init__(self, user_id, title, message, type='info', is_read=False):
        self.user_id = user_id
        self.title = title
        self.message = message
        self.type = type  # 'info', 'success', 'warning', 'alert'
        self.is_read = is_read
        self.created_at = datetime.utcnow()

    def to_dict(self):
        return {
            "user_id": self.user_id,
            "title": self.title,
            "message": self.message,
            "type": self.type,
            "is_read": self.is_read,
            "created_at": self.created_at
        }

class Inquiry:
    def __init__(self, name, email, subject, message, status='Pending', reply='', created_at=None):
        self.name = name
        self.email = email
        self.subject = subject
        self.message = message
        self.status = status  # 'Pending', 'Replied'
        self.reply = reply
        self.created_at = created_at or datetime.utcnow()

    def to_dict(self):
        return {
            "name": self.name,
            "email": self.email,
            "subject": self.subject,
            "message": self.message,
            "status": self.status,
            "reply": self.reply,
            "created_at": self.created_at
        }
