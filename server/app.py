from flask import Flask, jsonify, request
import uuid
from flask_cors import CORS
import os
import pymongo
from pymongo import MongoClient
from bson import ObjectId
import jwt
import datetime
from functools import wraps
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename

# Import local modules
from models import User, Complaint, Notification, Team, Inquiry, JSONEncoder
from ai_module import (
    predict_priority, 
    predict_resolution_time, 
    generate_resolution_workflow, 
    suggest_resources, 
    assess_risk,
    estimate_cost,
    assess_risk,
    estimate_cost,
    generate_system_report,
    estimate_cost,
    generate_system_report,
    generate_resolution_summary,
    predict_category,
    calculate_impact_metrics
)

# Load Environment Variables
from dotenv import load_dotenv
load_dotenv()

from flask_mail import Mail, Message

app = Flask(__name__)
CORS(app)
app.json_encoder = JSONEncoder

# Configuration
app.config['SECRET_KEY'] = 'supersecretkey_civicare_2025' # Change in production
MONGO_URI = os.environ.get('MONGO_URI', 'mongodb://localhost:27017/civicare_db')

# Email Config
app.config['MAIL_SERVER'] = os.environ.get('MAIL_SERVER')
app.config['MAIL_PORT'] = int(os.environ.get('MAIL_PORT', 465))
app.config['MAIL_USERNAME'] = os.environ.get('MAIL_USERNAME')
app.config['MAIL_PASSWORD'] = os.environ.get('MAIL_PASSWORD')
app.config['MAIL_USE_TLS'] = os.environ.get('MAIL_USE_TLS') == 'True'
app.config['MAIL_USE_SSL'] = os.environ.get('MAIL_USE_SSL') == 'True'
app.config['MAIL_DEFAULT_SENDER'] = os.environ.get('MAIL_DEFAULT_SENDER')

# Upload Config
UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'uploads')
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

mail = Mail(app)

# Database Setup
try:
    client = MongoClient(MONGO_URI)
    client.admin.command('ping')
    print(f"Connected to MongoDB at {MONGO_URI}")
except Exception as e:
    print(f"WARNING: Could not connect to MongoDB: {e}")

db = client.civicare_db
users_collection = db.users
complaints_collection = db.complaints
notifications_collection = db.notifications
teams_collection = db.teams

# --- Helpers ---
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'message': 'Token is missing!'}), 401
        try:
            if token.startswith('Bearer '):
                token = token.split(" ")[1]
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
            current_user = users_collection.find_one({"_id": ObjectId(data['user_id'])})
            if not current_user:
                return jsonify({'message': 'User no longer exists!'}), 401
        except Exception as e:
            return jsonify({'message': 'Token is invalid!'}), 401
        return f(current_user, *args, **kwargs)
    return decorated

@app.route('/')
def home():
    return jsonify({"message": "CiviCare API is running", "status": "online"})

# --- Upload Routes ---
from flask import send_from_directory

@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

@app.route('/api/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({"message": "No file part"}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({"message": "No selected file"}), 400
    if file:
        filename = secure_filename(file.filename)
        # Add UUID to filename to prevent collisions
        unique_filename = f"{uuid.uuid4().hex}_{filename}"
        file.save(os.path.join(app.config['UPLOAD_FOLDER'], unique_filename))
        
        # Return relative URL (proxied by frontend)
        file_url = f"/uploads/{unique_filename}"
        return jsonify({"url": file_url, "message": "File uploaded successfully"}), 200

# --- Auth Routes ---
@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.get_json()
    if users_collection.find_one({"email": data['email']}):
        return jsonify({"message": "User already exists"}), 400
    
    hashed_password = generate_password_hash(data['password'])
    
    # Generate Verification Token
    token = str(uuid.uuid4())
    
    new_user = User(
        username=data['username'],
        email=data['email'],
        password_hash=hashed_password, 
        role=data.get('role', 'citizen'),
        phone=data.get('phone', ''),
        ward=data.get('ward', ''),
        address=data.get('address', ''),
        id_number=data.get('id_number', ''),
        is_verified=False,
        verification_token=token
    )
    
    try:
        users_collection.insert_one(new_user.to_dict())
    except pymongo.errors.DuplicateKeyError:
        return jsonify({"message": "User already exists"}), 400
    
    # SEND REAL EMAIL
    try:
        msg = Message("Verify your CiviCare Account",
                      recipients=[data['email']])
        
        # dynamic IP detection
        import socket
        def get_local_ip():
            try:
                # connect to an external server (doesn't actually send data) to get the interface IP
                s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
                s.connect(("8.8.8.8", 80))
                local_ip = s.getsockname()[0]
                s.close()
                return local_ip
            except:
                return "localhost"

        # Use configurable URL for cross-device support
        base_url = os.environ.get('CLIENT_URL')
        if not base_url:
            local_ip = get_local_ip()
            base_url = f"http://{local_ip}:5173"

        link = f"{base_url}/verify?token={token}"
        
        msg.body = f"Welcome to CiviCare! \n\nPlease click the link below to verify your account:\n{link}\n\nIf you did not make this request, please ignore."
        mail.send(msg)
        print(f"Email sent to {data['email']} with link: {link}")
    except Exception as e:
        print(f"Error sending email: {e}")
        # Don't fail registration if email fails (for now), but log it
    
    # Notify Admins of New Citizen
    if data.get('role', 'citizen') == 'citizen':
        admins = users_collection.find({"role": "admin"})
        for admin in admins:
            notifications_collection.insert_one(Notification(
                user_id=str(admin['_id']),
                title="New Citizen Registered 👤",
                message=f"New user {data['username']} has joined.",
                type="info"
            ).to_dict())

    return jsonify({"message": "Registration successful! Please check your email to verify your account."}), 201

@app.route('/api/auth/verify', methods=['POST'])
def verify_email():
    data = request.get_json()
    token = data.get('token')
    
    user = users_collection.find_one({"verification_token": token})
    if not user:
        return jsonify({"message": "Invalid or expired token"}), 400
        
    users_collection.update_one(
        {"_id": user['_id']},
        {"$set": {"is_verified": True, "verification_token": ""}}
    )
    
    return jsonify({"message": "Email verified successfully!"})


# --- Resend Verification ---
@app.route('/api/auth/resend-verification', methods=['POST'])
def resend_verification():
    data = request.get_json()
    email = data.get('email')
    
    if not email:
        return jsonify({"message": "Email is required"}), 400
        
    user = users_collection.find_one({"email": email})
    if not user:
        return jsonify({"message": "User not found"}), 404
        
    if user.get('is_verified'):
        return jsonify({"message": "Email is already verified. Please login."}), 400
        
    token = user.get('verification_token')
    if not token:
        token = str(uuid.uuid4())
        users_collection.update_one(
            {"_id": user['_id']},
            {"$set": {"verification_token": token}}
        )
    
    # Send Email
    try:
        msg = Message("Verify your CiviCare Account", recipients=[email])
        
        # dynamic IP detection (reused logic, ideally move to helper)
        import socket
        def get_local_ip():
            try:
                s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
                s.connect(("8.8.8.8", 80))
                local_ip = s.getsockname()[0]
                s.close()
                return local_ip
            except:
                return "localhost"

        base_url = os.environ.get('CLIENT_URL')
        if not base_url:
            local_ip = get_local_ip()
            base_url = f"http://{local_ip}:5173"

        link = f"{base_url}/verify?token={token}"
        msg.body = f"Welcome to CiviCare! \n\nPlease click the link below to verify your account:\n{link}\n\nIf you did not make this request, please ignore."
        mail.send(msg)
        return jsonify({"message": "Verification email resent successfully!"})
    except Exception as e:
        print(f"Error sending email: {e}")
        return jsonify({"message": "Failed to send email"}), 500

# --- Forgot / Reset Password ---
@app.route('/api/auth/forgot-password', methods=['POST'])
def forgot_password():
    data = request.get_json()
    email = data.get('email', '').strip().lower()

    if not email:
        return jsonify({"message": "Email is required"}), 400

    user = users_collection.find_one({"email": email})
    # Always return the same response to prevent email enumeration
    if not user:
        return jsonify({"message": "If that email exists, a reset link has been sent."}), 200

    # Generate a short-lived reset token
    reset_token = str(uuid.uuid4())
    expiry = datetime.datetime.utcnow() + datetime.timedelta(hours=1)

    users_collection.update_one(
        {"_id": user["_id"]},
        {"$set": {"reset_token": reset_token, "reset_token_expiry": expiry}}
    )

    # Resolve client base URL
    import socket
    def get_local_ip():
        try:
            s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
            s.connect(("8.8.8.8", 80))
            ip = s.getsockname()[0]
            s.close()
            return ip
        except:
            return "localhost"

    base_url = os.environ.get("CLIENT_URL")
    if not base_url:
        base_url = f"http://{get_local_ip()}:5173"

    reset_link = f"{base_url}/reset-password?token={reset_token}"

    try:
        msg = Message("Reset Your CiviCare Password", recipients=[email])
        msg.body = (
            f"Hello {user['username']},\n\n"
            f"We received a request to reset your CiviCare password.\n\n"
            f"Click the link below to set a new password (valid for 1 hour):\n"
            f"{reset_link}\n\n"
            f"If you did not request this, you can safely ignore this email.\n\n"
            f"— The CiviCare Team"
        )
        msg.html = f"""
        <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:24px;background:#f9fafb;border-radius:12px">
          <h2 style="color:#1e40af">Reset Your Password</h2>
          <p>Hello <strong>{user['username']}</strong>,</p>
          <p>We received a request to reset your CiviCare password. Click below to continue:</p>
          <a href="{reset_link}" style="display:inline-block;margin:16px 0;padding:12px 24px;background:#2563eb;color:#fff;text-decoration:none;border-radius:8px;font-weight:bold">
            Reset Password
          </a>
          <p style="color:#6b7280;font-size:13px">This link expires in <strong>1 hour</strong>. If you didn't request this, ignore this email.</p>
          <hr style="border:none;border-top:1px solid #e5e7eb;margin:16px 0">
          <p style="color:#9ca3af;font-size:12px">— The CiviCare Team</p>
        </div>"""
        mail.send(msg)
    except Exception as e:
        print(f"Error sending reset email: {e}")
        return jsonify({"message": "Failed to send reset email. Check server config."}), 500

    return jsonify({"message": "If that email exists, a reset link has been sent."})


@app.route('/api/auth/reset-password', methods=['POST'])
def reset_password():
    data = request.get_json()
    token = data.get('token', '').strip()
    new_password = data.get('password', '')

    if not token or not new_password:
        return jsonify({"message": "Token and new password are required"}), 400

    if len(new_password) < 8:
        return jsonify({"message": "Password must be at least 8 characters"}), 400

    import re
    if not re.search(r'[A-Z]', new_password):
        return jsonify({"message": "Password must include at least one uppercase letter"}), 400
    if not re.search(r'[0-9]', new_password):
        return jsonify({"message": "Password must include at least one number"}), 400
    if not re.search(r'[^A-Za-z0-9]', new_password):
        return jsonify({"message": "Password must include at least one special character"}), 400

    user = users_collection.find_one({"reset_token": token})
    if not user:
        return jsonify({"message": "Invalid or expired reset link"}), 400

    expiry = user.get("reset_token_expiry")
    if expiry and datetime.datetime.utcnow() > expiry:
        return jsonify({"message": "Reset link has expired. Please request a new one."}), 400

    users_collection.update_one(
        {"_id": user["_id"]},
        {"$set": {"password_hash": generate_password_hash(new_password)},
         "$unset": {"reset_token": "", "reset_token_expiry": ""}}
    )

    return jsonify({"message": "Password reset successfully! You can now log in."})


@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    user = users_collection.find_one({"email": data['email']})
    
    if not user:
        return jsonify({"message": "Email not found"}), 404

    if not check_password_hash(user['password_hash'], data['password']):
         return jsonify({"message": "Invalid password"}), 401

    # Enforce Verification
    if not user.get('is_verified', False) and user.get('role') != 'admin':
        return jsonify({"message": "Please verify your email first."}), 403

    token = jwt.encode({
        'user_id': str(user['_id']),
        'role': user['role'],
        'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
    }, app.config['SECRET_KEY'], algorithm="HS256")
    
    return jsonify({
        "token": token,
        "user": {
            "username": user['username'],
            "email": user['email'],
            "role": user['role'],
            "phone": user.get('phone', ''),
            "address": user.get('address', ''),
            "profile_photo": user.get('profile_photo', ''),
            "id_number": user.get('id_number', ''),
            "is_verified": user.get('is_verified', False)
        }
    })

@app.route('/api/auth/me', methods=['GET'])
@token_required
def get_current_user(current_user):
    return jsonify({
        "username": current_user['username'],
        "email": current_user['email'],
        "role": current_user['role'],
        "phone": current_user.get('phone', ''),
        "ward": current_user.get('ward', ''),
        "bio": current_user.get('bio', '')
    })

@app.route('/api/auth/profile', methods=['PUT'])
@token_required
def update_profile(current_user):
    data = request.get_json()
    update_fields = {}
    
    if 'username' in data: update_fields['username'] = data['username']
    if 'phone' in data: update_fields['phone'] = data['phone']
    if 'bio' in data: update_fields['bio'] = data['bio']
    if 'ward' in data: update_fields['ward'] = data['ward']
    if 'address' in data: update_fields['address'] = data['address']
    if 'profile_photo' in data: update_fields['profile_photo'] = data['profile_photo']
    
    if 'new_password' in data and data['new_password']:
        update_fields['password_hash'] = generate_password_hash(data['new_password'])
        
    if update_fields:
        users_collection.update_one(
            {"_id": current_user['_id']},
            {"$set": update_fields}
        )
        
    return jsonify({"message": "Profile updated successfully"})

@app.route('/api/auth/change-password', methods=['POST'])
@token_required
def change_password(current_user):
    data = request.get_json()
    current_password = data.get('current_password', '')
    new_password = data.get('new_password', '')

    if not current_password or not new_password:
        return jsonify({"message": "Both current and new password are required."}), 400

    if not check_password_hash(current_user['password_hash'], current_password):
        return jsonify({"message": "Current password is incorrect."}), 401

    if len(new_password) < 6:
        return jsonify({"message": "New password must be at least 6 characters."}), 400

    users_collection.update_one(
        {"_id": current_user['_id']},
        {"$set": {"password_hash": generate_password_hash(new_password)}}
    )
    return jsonify({"message": "Password changed successfully!"})

@app.route('/api/auth/profile', methods=['GET'])
@token_required
def get_profile_stats(current_user):
    # Calculate Rank based on XP
    xp = current_user.get('xp', 0)
    level = current_user.get('level', 1)
    
    rank = "Novice Citizen"
    if xp > 1000: rank = "Active Contributor"
    if xp > 3000: rank = "Civic Guardian"
    if xp > 5000: rank = "City Hero"
    if xp > 10000: rank = "Legendary Mayor"

    # Calculate Complaints Solved
    solved_count = complaints_collection.count_documents({
        "user_id": str(current_user['_id']), 
        "status": "Resolved"
    })
    
    return jsonify({
        "username": current_user['username'],
        "email": current_user['email'],
        "role": current_user['role'],
        "phone": current_user.get('phone', ''),
        "ward": current_user.get('ward', ''),
        "address": current_user.get('address', ''),
        "id_number": current_user.get('id_number', ''),
        "is_verified": current_user.get('is_verified', False),
        "profile_photo": current_user.get('profile_photo', ''),
        
        # Gamification Stats
        "stats": {
            "xp": xp,
            "level": level,
            "nextLevelXp": level * 1000, 
            "rank": rank,
            "complaintsSolved": solved_count,
            "badges": current_user.get('badges', [])
        }
    })

# --- Admin User Management ---
@app.route('/api/admin/users', methods=['GET'])
@token_required
def get_all_users(current_user):
    if current_user['role'] not in ['admin', 'supervisor']:
        return jsonify({"message": "Unauthorized"}), 403
        
    start = int(request.args.get('start', 0))
    limit = int(request.args.get('limit', 100))
    role_filter = request.args.get('role')
    
    query = {}
    if role_filter:
        query['role'] = role_filter
        
    users = list(users_collection.find(query).skip(start).limit(limit))
    for u in users:
        u['_id'] = str(u['_id'])
        
    return jsonify(users)

@app.route('/api/admin/users', methods=['POST'])
@token_required
def create_staff_user(current_user):
    if current_user['role'] != 'admin':
        return jsonify({"message": "Unauthorized"}), 403
    
    data = request.get_json()
    if users_collection.find_one({"email": data['email']}):
        return jsonify({"message": "User already exists"}), 400
        
    hashed_password = generate_password_hash(data['password'])
    
    new_user = User(
        username=data['username'],
        email=data['email'],
        password_hash=hashed_password,
        role=data.get('role', 'staff'), # staff, admin, field_officer, supervisor
        phone=data.get('phone', ''),
        ward=data.get('ward', ''),
        specialization=data.get('specialization', 'General')
    )
    
    users_collection.insert_one(new_user.to_dict())
    return jsonify({"message": "User created successfully"}), 201

@app.route('/api/admin/users/<id>', methods=['DELETE'])
@token_required
def delete_user(current_user, id):
    if current_user['role'] != 'admin':
        return jsonify({"message": "Unauthorized"}), 403
    
    if str(current_user['_id']) == id:
        return jsonify({"message": "Cannot delete yourself"}), 400

    result = users_collection.delete_one({"_id": ObjectId(id)})
    if result.deleted_count == 1:
        return jsonify({"message": "User deleted"})
    return jsonify({"message": "User not found"}), 404

@app.route('/api/admin/users/<id>/toggle-status', methods=['PATCH'])
@token_required
def toggle_user_status(current_user, id):
    if current_user['role'] != 'admin':
        return jsonify({"message": "Unauthorized"}), 403

    if str(current_user['_id']) == id:
        return jsonify({"message": "Cannot deactivate yourself"}), 400

    user = users_collection.find_one({"_id": ObjectId(id)})
    if not user:
        return jsonify({"message": "User not found"}), 404

    if user.get('role') == 'admin':
        return jsonify({"message": "Cannot change status of another admin"}), 400

    new_status = not user.get('is_active', True)
    users_collection.update_one(
        {"_id": ObjectId(id)},
        {"$set": {"is_active": new_status}}
    )
    return jsonify({"message": f"User {'activated' if new_status else 'deactivated'}", "is_active": new_status})

# --- Team Routes ---
@app.route('/api/admin/teams', methods=['POST'])
@token_required
def create_team(current_user):
    if current_user['role'] != 'admin':
        return jsonify({"message": "Unauthorized"}), 403
    
    data = request.get_json()
    if teams_collection.find_one({"name": data['name']}):
        return jsonify({"message": "Team name already exists"}), 400
        
    new_team = Team(
        name=data['name'],
        supervisor_id=data['supervisor_id'],
        members=data.get('members', []),
        specialization=data.get('specialization', 'General')
    )
    
    teams_collection.insert_one(new_team.to_dict())
    return jsonify({"message": "Team created successfully"}), 201

@app.route('/api/admin/teams', methods=['GET'])
@token_required
def get_teams(current_user):
    if current_user['role'] not in ['admin', 'supervisor']:
        return jsonify({"message": "Unauthorized"}), 403
    
    query = {}
    if current_user['role'] == 'supervisor':
        query['supervisor_id'] = str(current_user['_id'])
        
    teams = list(teams_collection.find(query).sort("created_at", -1))
    
    # Expand details
    for t in teams:
        t['_id'] = str(t['_id'])
        # Fetch supervisor name
        if t['supervisor_id']:
            sup = users_collection.find_one({"_id": ObjectId(t['supervisor_id'])})
            t['supervisor_details'] = {"username": sup['username']} if sup else {"username": "Unknown"}
            
        # Fetch member count
        t['member_count'] = len(t['members'])
        
        # Simulate Live GPS Location / Distance from a target
        # In a real app, we'd calculate distance from the complaint's coordinates
        import random
        t['current_distance_km'] = round(random.uniform(0.5, 15.0), 1)
        
    return jsonify(teams)

@app.route('/api/admin/teams/<id>', methods=['DELETE'])
@token_required
def delete_team(current_user, id):
    if current_user['role'] != 'admin':
        return jsonify({"message": "Unauthorized"}), 403

    result = teams_collection.delete_one({"_id": ObjectId(id)})
    if result.deleted_count == 1:
        return jsonify({"message": "Team deleted"})
    return jsonify({"message": "Team not found"}), 404

# --- Complaint Routes ---
@app.route('/api/complaints', methods=['POST'])
@token_required
def create_complaint(current_user):
    # Handle Form Data & Files
    if request.content_type.startswith('multipart/form-data'):
        data = request.form.to_dict()
        files = request.files
    else:
        data = request.get_json()
        files = {}

    photo_url = ""
    proof_url = ""

    # Check for Upload Folder
    upload_folder = os.path.join(app.root_path, 'static', 'uploads')
    os.makedirs(upload_folder, exist_ok=True)

    # Process Photo
    if 'photo' in files and files['photo'].filename != '':
        photo = files['photo']
        filename = secure_filename(f"{uuid.uuid4()}_{photo.filename}")
        photo.save(os.path.join(upload_folder, filename))
        photo_url = f"/static/uploads/{filename}"

    # Process Proof
    if 'proof' in files and files['proof'].filename != '':
        proof = files['proof']
        filename = secure_filename(f"{uuid.uuid4()}_{proof.filename}")
        proof.save(os.path.join(upload_folder, filename))
        proof_url = f"/static/uploads/{filename}"
    
    # 1. Predict Priority using AI
    predicted_priority = predict_priority(data.get('description', ''))
    
    # 2. Predict Category using AI (if not specifically set or if 'Other')
    input_category = data.get('category', 'Other')
    predicted_category = predict_category(data.get('description', ''))
    
    final_category = input_category
    if input_category == 'Other' and predicted_category != 'Other':
        final_category = predicted_category

    # 3. Create Complaint Object
    new_complaint = Complaint(
        user_id=str(current_user['_id']),
        title=data.get('title', 'Issue Report'),
        description=data.get('description', ''),
        category=final_category,
        priority=predicted_priority,
        location_address=data.get('location_address', ''),
        ward=data.get('ward', ''),
        contact_phone=data.get('contact_phone', ''),
        photo_url=photo_url,
        proof_url=proof_url
    )
    
    # Store initial AI analysis
    new_complaint.ai_analysis = {
        "predicted_category": predicted_category,
        "original_category": input_category,
        "confidence": 85 if final_category == predicted_category else 50
    }
    
    complaint_dict = new_complaint.to_dict()
    result = complaints_collection.insert_one(complaint_dict)
    
    # Notify Admins of New Complaint
    admins = users_collection.find({"role": "admin"})
    for admin in admins:
        notifications_collection.insert_one(Notification(
            user_id=str(admin['_id']),
            title="New Complaint Received 📝",
            message=f"New {data['category']} complaint reported: {data.get('title', 'Issue')}",
            type="info"
        ).to_dict())

    return jsonify({
        "message": "Complaint submitted successfully",
        "complaint_id": str(result.inserted_id),
        "ai_priority": predicted_priority
    }), 201

@app.route('/api/complaints', methods=['GET'])
@token_required
def get_complaints(current_user):
    # Admin: All complaints
    if current_user['role'] == 'admin':
        complaints = list(complaints_collection.find().sort("created_at", -1))
    
    # Supervisor: Only complaints assigned to them OR their team
    elif current_user['role'] == 'supervisor':
        # Find teams managed by this supervisor
        managed_teams = list(teams_collection.find({"supervisor_id": str(current_user['_id'])}))
        team_ids = [str(t['_id']) for t in managed_teams]
        
        query = {
            "$or": [
                {"assigned_supervisor": str(current_user['_id'])},
                {"assigned_team": {"$in": team_ids}}
            ]
        }
        complaints = list(complaints_collection.find(query).sort("created_at", -1))
        
    # Staff / Field Officer: Only assigned to their team
    elif current_user['role'] in ['staff', 'field_officer']:
        # This is simplified; ideally we check if they are in the assigned team's member list
        # For now, let's assume direct assignment or via team lookup (complex)
        # To keep it simple for MVP:
        complaints = list(complaints_collection.find().sort("created_at", -1)) 
        # CAUTION: Staff logic needs refine, but focusing on Supervisor for now as requested.
        
    # Citizen: Only their own
    else:
        complaints = list(complaints_collection.find({"user_id": str(current_user['_id'])}).sort("created_at", -1))
    
    # Convert ObjectIds to str
    for c in complaints:
        c['_id'] = str(c['_id'])
        
    return jsonify(complaints)


# ── Supervisor Dashboard API ────────────────────────────────────────────────
@app.route('/api/supervisor/dashboard', methods=['GET'])
@token_required
def supervisor_dashboard(current_user):
    """Returns live stats + enriched task list for the logged-in supervisor."""
    if current_user['role'] != 'supervisor':
        return jsonify({"message": "Unauthorized"}), 403

    sup_id = str(current_user['_id'])

    # 1. Find all teams managed by this supervisor
    managed_teams = list(teams_collection.find({"supervisor_id": sup_id}))
    team_ids = [str(t['_id']) for t in managed_teams]

    # 2. Fetch all complaints belonging to this supervisor
    query = {
        "$or": [
            {"assigned_supervisor": sup_id},
            {"assigned_team": {"$in": team_ids}}
        ]
    }
    complaints = list(complaints_collection.find(query).sort("created_at", -1))

    # 3. Enrich each complaint with field officer / team details
    def _user_card(uid):
        """Fetch a minimal user card by string ID."""
        try:
            u = users_collection.find_one({"_id": ObjectId(uid)})
            if u:
                return {
                    "id": str(u['_id']),
                    "username": u.get('username', 'Unknown'),
                    "email": u.get('email', ''),
                    "phone": u.get('phone', 'N/A'),
                    "role": u.get('role', 'field_officer'),
                    "specialization": u.get('specialization', 'General'),
                    "ward": u.get('ward', 'N/A'),
                    "profile_photo": u.get('profile_photo', '')
                }
        except Exception:
            pass
        return None

    enriched = []
    for c in complaints:
        c['_id'] = str(c['_id'])

        # Expand assigned team + its members (field officers)
        if c.get('assigned_team'):
            try:
                team = teams_collection.find_one({"_id": ObjectId(c['assigned_team'])})
                if team:
                    members_detail = [_user_card(m) for m in team.get('members', []) if _user_card(m)]
                    c['team_details'] = {
                        "id": str(team['_id']),
                        "name": team.get('name', 'Unknown Team'),
                        "specialization": team.get('specialization', 'General'),
                        "members": members_detail,
                        "member_count": len(members_detail)
                    }
                    c['field_officers'] = members_detail
            except Exception as e:
                print(f"Team expand error: {e}")

        # Expand citizen
        if c.get('user_id'):
            citizen = users_collection.find_one({"_id": ObjectId(c['user_id'])})
            if citizen:
                c['citizen_details'] = {
                    "username": citizen.get('username', 'N/A'),
                    "email": citizen.get('email', ''),
                    "phone": citizen.get('phone', 'N/A')
                }

        enriched.append(c)

    # 4. Compute live stats
    statuses = [c['status'] for c in enriched]
    stats = {
        "total": len(enriched),
        "active": sum(1 for s in statuses if s == 'In Progress'),
        "pending": sum(1 for s in statuses if s == 'Pending'),
        "pending_verification": sum(1 for s in statuses if s == 'Pending Verification'),
        "completed": sum(1 for s in statuses if s == 'Resolved'),
        "rejected": sum(1 for s in statuses if s == 'Rejected'),
        "high_priority": sum(1 for c in enriched if c.get('priority') == 'High' and c['status'] not in ['Resolved', 'Rejected']),
        "teams_count": len(team_ids)
    }

    return jsonify({"stats": stats, "tasks": enriched})



@app.route('/api/complaints/<id>', methods=['GET'])
@token_required
def get_complaint_detail(current_user, id):
    try:
        complaint = complaints_collection.find_one({"_id": ObjectId(id)})
    except:
        return jsonify({"message": "Invalid Complaint ID"}), 400
        
    if not complaint:
        return jsonify({"message": "Complaint not found"}), 404
        
    complaint['_id'] = str(complaint['_id'])
    
    # Expand Assigned Team Member details
    if complaint.get('assigned_team'):
        team_member = users_collection.find_one({"_id": ObjectId(complaint['assigned_team'])})
        if team_member:
            complaint['assigned_team_details'] = {
                "username": team_member['username'],
                "email": team_member['email'],
                "phone": team_member.get('phone', '')
            }
            
    # Expand Citizen Details (Complaint Maker)
    if complaint.get('user_id'):
        citizen = users_collection.find_one({"_id": ObjectId(complaint['user_id'])})
        if citizen:
            complaint['citizen_details'] = {
                "username": citizen['username'],
                "email": citizen['email'],
                "phone": citizen.get('phone', 'N/A'),
                "address": citizen.get('address', 'N/A')
            }
            
    # Expand Supervisor Details
    if complaint.get('assigned_supervisor'):
        try:
            supervisor = users_collection.find_one({"_id": ObjectId(complaint['assigned_supervisor'])})
            if supervisor:
                complaint['supervisor_details'] = {
                    "username": supervisor['username'],
                    "email": supervisor['email'],
                    "phone": supervisor.get('phone', 'N/A')
                }
        except:
            print(f"Error fetching supervisor for {complaint['_id']}")


    return jsonify(complaint)

@app.route('/api/complaints/<id>', methods=['PUT'])
@token_required
def update_complaint_status(current_user, id):
    # Allow staff to update status (e.g. resolve on ground)
    if current_user['role'] not in ['admin', 'supervisor', 'staff', 'field_officer']:
        return jsonify({"message": "Unauthorized"}), 403
        
    data = request.get_json()
    status = data.get('status')
    
    if status:
        update_fields = {"status": status}
        
        # 1. STATUS: PENDING VERIFICATION (Supervisor/Staff submits proof)
        if status == 'Pending Verification':
            proof_data = data.get('proof', {})
            update_fields["resolution_proof"] = {
                "submitted_by": current_user['username'],
                "submitted_at": datetime.datetime.utcnow(),
                "remarks": proof_data.get('remarks', 'Work completed'),
                "image_url": proof_data.get('image_url', '')
            }
            
            # Ensure timeline exists
            complaint = complaints_collection.find_one({"_id": ObjectId(id)})
            update_fields["timeline"] = complaint.get('timeline', [])
            update_fields["timeline"].append({
                "status": "Pending Verification",
                "date": datetime.datetime.utcnow(),
                "note": f"Proof submitted by {current_user['username']}. Awaiting Admin Approval.",
                "by": current_user['username']
            })
            
            # Notify Admin
            admins = users_collection.find({"role": "admin"})
            for admin in admins:
                notifications_collection.insert_one(Notification(
                    user_id=str(admin['_id']),
                    title="Verification Required 🛡️",
                    message=f"Complaint #{id} requires verification. Proof submitted by {current_user['username']}.",
                    type="warning"
                ).to_dict())
                
        # 1.5 STATUS: EMERGENCY VERIFIED (Auto-Assign Emergency Team)
        elif status == 'Emergency Verified':
            complaint = complaints_collection.find_one({"_id": ObjectId(id)})
            
            # Find Emergency Team for this Category
            from models import Team
            spec_key = f"Emergency - {complaint['category']}"
            
            # Fallback for Traffic -> Emergency - Traffic, etc.
            # If category is 'Other', default to Road or General? Let's try Exact Match first.
            emergency_team = teams_collection.find_one({"specialization": spec_key})
            
            # Fallback logic if specific team not found
            if not emergency_team:
                print(f"Warning: No specific emergency team for {spec_key}. Assigning to Fire/General.")
                emergency_team = teams_collection.find_one({"specialization": "Emergency - Fire"}) # Fallback to Fire/General
                
            timeline_note = "Emergency Verified by Admin. "
            if emergency_team:
                update_fields["assigned_team"] = str(emergency_team['_id'])
                update_fields["status"] = "In Progress" # Auto-move to In Progress
                timeline_note += f"Auto-assigned to {emergency_team['name']}."
                
                # Notify Team Supervisor
                notifications_collection.insert_one(Notification(
                    user_id=emergency_team['supervisor_id'],
                    title="🚨 EMERGENCY ASSIGNMENT",
                    message=f"URGENT: New Emergency Complaint #{id} assigned to your team. Please mobilize immediately.",
                    type="critical"
                ).to_dict())
            else:
                timeline_note += "No Emergency Team available. Manual assignment required."
                update_fields["status"] = "Pending" # Stay pending if no team

            update_fields["timeline"] = complaint.get('timeline', [])
            update_fields["timeline"].append({
                "status": "In Progress" if emergency_team else "Verified",
                "date": datetime.datetime.utcnow(),
                "note": timeline_note,
                "by": current_user['username']
            })
            
            # Notify User
            notifications_collection.insert_one(Notification(
                user_id=complaint['user_id'],
                title="Emergency Squad Dispatched 🚒",
                message="Your emergency report has been verified. A Rapid Response Team has been dispatched.",
                type="alert"
            ).to_dict())

        # 2. STATUS: REJECTED (Fails Scrutiny)
        elif status == 'Rejected':
            complaint = complaints_collection.find_one({"_id": ObjectId(id)})
            
            # Reduce XP (Penalty for false reporting) - Optional
            # users_collection.update_one({"_id": ObjectId(complaint['user_id'])}, {"$inc": {"xp": -10}})
            
            update_fields["timeline"] = complaint.get('timeline', [])
            update_fields["timeline"].append({
                "status": "Rejected",
                "date": datetime.datetime.utcnow(),
                "note": f"Complaint rejected during scrutiny. Reason: {data.get('remarks', 'Invalid Report')}",
                "by": current_user['username']
            })
            
            notifications_collection.insert_one(Notification(
                user_id=complaint['user_id'],
                title="Complaint Rejected ❌",
                message=f"Your complaint was rejected after scrutiny. Reason: {data.get('remarks', 'Does not meet criteria')}.",
                type="alert"
            ).to_dict())

        # 3. STATUS: VERIFIED (Passes Scrutiny)
        elif status == 'Verified':
            complaint = complaints_collection.find_one({"_id": ObjectId(id)})
            update_fields["timeline"] = complaint.get('timeline', [])
            update_fields["timeline"].append({
                "status": "Verified",
                "date": datetime.datetime.utcnow(),
                "note": "Complaint verified & approved for assignment.",
                "by": current_user['username']
            })
            
            notifications_collection.insert_one(Notification(
                user_id=complaint['user_id'],
                title="Complaint Verified ✅",
                message="Your complaint has been verified and will be assigned shortly.",
                type="info"
            ).to_dict())

            # 4. STATUS: RESOLVED (Admin Final Approval)
        elif status == 'Resolved':
            if current_user['role'] != 'admin': # Double check admin
                 return jsonify({"message": "Only Admins can finalize resolution"}), 403
            
            # --- GAMIFICATION & AI REPORT ---
            complaint = complaints_collection.find_one({"_id": ObjectId(id)})
            
            # Calculate Time Metrics
            created_at = complaint['created_at']
            if isinstance(created_at, str):
                created_at = datetime.datetime.fromisoformat(created_at.replace('Z', '+00:00'))
                
            now = datetime.datetime.utcnow()
            days_taken = (now - created_at).days
            
            # Generate AI Report
            proof_remarks = complaint.get('resolution_proof', {}).get('remarks', '')
            final_remarks = generate_resolution_summary(complaint['category'], days_taken, proof_remarks)
            
            resolution_report = {
                "resolved_at": now,
                "resolved_by": current_user['username'],
                "days_taken": days_taken,
                "final_remarks": final_remarks,
                "metrics": {
                    "efficiency": "High" if days_taken < 3 else "Standard"
                }
            }
            
            update_fields["resolution_report"] = resolution_report
            
            # Award XP
            try:
                users_collection.update_one(
                    {"_id": ObjectId(complaint['user_id'])},
                    {
                        "$inc": {"xp": 100, "impact_score": 50},
                        "$set": {"level": 1} # Placeholder
                    }
                )
            except Exception as e:
                print(f"XP Error: {e}")

            # Notify User
            notifications_collection.insert_one(Notification(
                user_id=complaint['user_id'],
                title="Problem Solved! 🎉",
                message=f"Your complaint has been officially resolved. {final_remarks}",
                type="success"
            ).to_dict())
            
            update_fields["timeline"] = complaint.get('timeline', [])
            update_fields["timeline"].append({
                "status": "Resolved",
                "date": now,
                "note": "Official Resolution & Closure.",
                "by": current_user['username']
            })
            
            duration = now - created_at
            days_taken = round(duration.total_seconds() / 86400, 1)
            
            # Deadline comparison
            deadline_note = "On Time"
            delay_days = 0
            if complaint.get('deadline'):
                deadline = complaint['deadline']
                if isinstance(deadline, str):
                    deadline = datetime.datetime.fromisoformat(deadline.replace('Z', '+00:00'))
                
                if now > deadline:
                    delay = now - deadline
                    delay_days = round(delay.total_seconds() / 86400, 1)
                    deadline_note = f"Delayed by {delay_days} days"
            
            # Generate Report Structure
            proof = complaint.get('resolution_proof', {})
            
            # Fetch Citizen Data for Snapshot
            citizen_snapshot = {}
            try:
                citizen = users_collection.find_one({"_id": ObjectId(complaint['user_id'])})
                if citizen:
                    citizen_snapshot = {
                        "name": citizen.get('username', 'Unknown'),
                        "phone": citizen.get('phone', 'N/A'),
                        "email": citizen.get('email', 'N/A')
                    }
            except: pass

            # Cost Structure (Use AI estimate or default)
            cost_data = complaint.get('ai_analysis', {}).get('cost', {})
            final_cost = f"{cost_data.get('min', 0)} - {cost_data.get('max', 0)} INR"

            report = {
                "generated_at": now,
                "resolved_by": current_user['username'],
                "final_remarks": data.get('remarks', 'Verified & Closed.'),
                "proof_summary": proof, # Associate proof
                "citizen_snapshot": citizen_snapshot, # New: Snapshot user details
                "location_snapshot": complaint.get('location_address', 'N/A'), # New: Snapshot location
                "cost_snapshot": final_cost, # New: Snapshot cost
                "metrics": {
                    "days_taken": days_taken,
                    "status_note": deadline_note,
                    "delay": delay_days
                },
                "team_summary": "Task Force" 
            }
            
            update_fields["resolution_report"] = report
            update_fields["timeline"] = complaint.get('timeline', [])
            update_fields["timeline"].append({
                "status": "Resolved",
                "date": now,
                "note": f"Resolution Verified & Closed by Admin. Duration: {days_taken} days.",
                "by": current_user['username']
            })

            # 1. Notify Citizen
            notifications_collection.insert_one(Notification(
                user_id=complaint['user_id'],
                title="Complaint Solved! 🌟",
                message=f"Your issue has been resolved in {days_taken} days.",
                type="success"
            ).to_dict())

            # 2. Notify Supervisor
            if complaint.get('assigned_supervisor'):
                notifications_collection.insert_one(Notification(
                    user_id=complaint['assigned_supervisor'],
                    title="Work Verified ✅",
                    message=f"Your work on Complaint #{id} has been verified and closed.",
                    type="success"
                ).to_dict())

        complaints_collection.update_one(
            {"_id": ObjectId(id)},
            {"$set": update_fields}
        )
    
    return jsonify({"message": "Status updated", "status": status})

@app.route('/api/complaints/<id>/assign', methods=['PUT'])
@token_required
def assign_complaint(current_user, id):
    if current_user['role'] != 'admin':
        return jsonify({"message": "Unauthorized"}), 403
    
    data = request.get_json()
    team_id = data.get('team_id')
    supervisor_id = data.get('supervisor_id')
    
    if not team_id:
        return jsonify({"message": "Team ID required"}), 400
        
    update_data = {
        "assigned_team": team_id,
        "status": "In Progress"
    }
    
    timeline_note = f"Assigned to team member {team_id}"
    
    if supervisor_id:
        update_data["assigned_supervisor"] = supervisor_id
        timeline_note += f" and supervisor {supervisor_id}"
        
    complaints_collection.update_one(
        {"_id": ObjectId(id)},
        {
            "$set": update_data,
            "$push": {
                "timeline": {
                    "status": "Assigned",
                    "date": datetime.datetime.utcnow(),
                    "note": timeline_note,
                    "by": current_user['username']
                }
            }
        }
    )
    
    # Notify the staff member
    notifications_collection.insert_one(Notification(
        user_id=team_id,
        title="New Task Assigned",
        message=f"You have been assigned complaint #{id}",
        type="warning"
    ).to_dict())
    
    # Notify the supervisor
    if supervisor_id:
        notifications_collection.insert_one(Notification(
            user_id=supervisor_id,
            title="New Supervision Task",
            message=f"You are supervising complaint #{id}",
            type="info"
        ).to_dict())
    
    return jsonify({"message": "Team assigned successfully"})

@app.route('/api/complaints/<id>/assign-custom', methods=['POST'])
@token_required
def assign_custom_team(current_user, id):
    if current_user['role'] not in ['admin', 'supervisor']:
        return jsonify({"message": "Unauthorized"}), 403
        
    data = request.get_json()
    member_ids = data.get('member_ids', [])
    supervisor_id = data.get('supervisor_id')
    
    if not member_ids:
        return jsonify({"message": "No members selected"}), 400
        
    # Create Ad-Hoc Team
    complaint = complaints_collection.find_one({"_id": ObjectId(id)})
    team_name = f"Task Force - {complaint['title'][:15]}..."
    
    new_team = Team(
        name=team_name,
        supervisor_id=supervisor_id if supervisor_id else str(current_user['_id']),
        members=member_ids,
        specialization=complaint['category'] + " (Custom)"
    )
    
    team_result = teams_collection.insert_one(new_team.to_dict())
    team_id = str(team_result.inserted_id)
    
    # Assign Team
    update_data = {
        "assigned_team": team_id,
        "assigned_supervisor": supervisor_id,
        "status": "In Progress"
    }
    
    # Trigger AI Update for new Team Size
    team_size = len(member_ids)
    days, confidence = predict_resolution_time(complaint['category'], complaint['priority'], team_size)
    deadline = datetime.datetime.utcnow() + datetime.timedelta(days=days)
    
    update_data['deadline'] = deadline
    # Update AI Analysis with new prediction
    complaints_collection.update_one(
        {"_id": ObjectId(id)},
        {"$set": {"ai_analysis.predicted_days": days, "deadline": deadline}}
    )

    complaints_collection.update_one(
        {"_id": ObjectId(id)},
        {
            "$set": update_data,
            "$push": {
                "timeline": {
                    "status": "Custom Team Assigned",
                    "date": datetime.datetime.utcnow(),
                    "note": f"Formed custom team of {team_size} members",
                    "by": current_user['username']
                }
            }
        }
    )
    
    return jsonify({"message": "Custom Team Formed & Assigned"})

@app.route('/api/complaints/<id>/ai-predict', methods=['POST'])
@token_required
def ai_predict_complaint(current_user, id):
    if current_user['role'] != 'admin':
        return jsonify({"message": "Unauthorized"}), 403
        
    complaint = complaints_collection.find_one({"_id": ObjectId(id)})
    if not complaint:
        return jsonify({"message": "Not found"}), 404
    
    # Calculate Team Size
    team_size = 1
    if complaint.get('assigned_team'):
        team = teams_collection.find_one({"_id": ObjectId(complaint['assigned_team'])})
        if team: # It was a Team Object ID
            team_size = len(team.get('members', [])) + 1
            
    days, confidence = predict_resolution_time(complaint['category'], complaint['priority'], team_size)
    predicted_category = predict_category(complaint.get('description', ''))
    
    steps = generate_resolution_workflow(complaint['category'], complaint['priority'])
    resources = suggest_resources(complaint['category'], complaint['priority'])
    risk_level, risk_factors = assess_risk(complaint['category'], complaint.get('description', ''), complaint['priority'])
    min_cost, max_cost, currency = estimate_cost(complaint['category'], complaint['priority'])
    impact_metrics = calculate_impact_metrics(complaint['category'], complaint['priority'], complaint.get('description', ''))
    
    deadline = datetime.datetime.utcnow() + datetime.timedelta(days=days)
    
    complaints_collection.update_one(
        {"_id": ObjectId(id)},
        {
            "$set": {
                "deadline": deadline,
                "ai_analysis": {
                    "predicted_category": predicted_category,
                    "predicted_days": days,
                    "confidence": confidence,
                    "suggested_action": "Standard Protocol",
                    "steps": steps,
                    "resources": resources,
                    "risk": {
                        "level": risk_level,
                        "factors": risk_factors
                    },
                    "cost": {
                        "min": min_cost,
                        "max": max_cost,
                        "currency": currency
                    },
                    "impact_metrics": impact_metrics
                }
            },
             "$push": {
                "timeline": {
                    "status": "AI Analysis",
                    "date": datetime.datetime.utcnow(),
                    "note": f"AI predicted deadline: {deadline.strftime('%Y-%m-%d')}",
                    "by": "System AI"
                }
            }
        }
    )
    
    return jsonify({"message": "AI Prediction Complete"})

    return jsonify({"message": "AI Prediction Complete"})

# --- Notification Routes ---


# --- Analytics Routes ---
@app.route('/api/admin/analytics', methods=['GET'])
@token_required
def get_analytics(current_user):
    if current_user['role'] not in ['admin', 'supervisor']:
        return jsonify({"message": "Unauthorized"}), 403

    # Fetch all complaints for analysis
    cursor = complaints_collection.find({})
    complaints_list = [c for c in cursor]
    
    report = generate_system_report(complaints_list)
    return jsonify(report)

# --- Dashboard Stats ---
@app.route('/api/admin/stats', methods=['GET'])
@token_required
def get_dashboard_stats(current_user):
    if current_user['role'] not in ['admin', 'supervisor']:
        return jsonify({"message": "Unauthorized"}), 403
        
    total_complaints = complaints_collection.count_documents({})
    resolved = complaints_collection.count_documents({"status": "Resolved"})
    pending = complaints_collection.count_documents({"status": "Pending"})
    in_progress = complaints_collection.count_documents({"status": "In Progress"})
    high_priority = complaints_collection.count_documents({"priority": "High"})
    
    # User Stats
    total_users = users_collection.count_documents({})
    staff_count = users_collection.count_documents({"role": {"$in": ["staff", "supervisor", "field_officer"]}})
    citizen_count = users_collection.count_documents({"role": "citizen"})
    
    # Gamification Stats
    total_xp_pipeline = [{"$group": {"_id": None, "total": {"$sum": "$xp"}}}]
    xp_result = list(users_collection.aggregate(total_xp_pipeline))
    total_xp = xp_result[0]['total'] if xp_result else 0
    
    # Top Staff (Supervisors/Field Officers)
    top_staff_cursor = users_collection.find(
        {"role": {"$in": ["supervisor", "field_officer"]}},
        {"username": 1, "xp": 1, "specialization": 1, "role": 1, "impact_score": 1}
    ).sort("impact_score", -1).limit(3)
    
    top_staff = []
    for s in top_staff_cursor:
        s['_id'] = str(s['_id'])
        top_staff.append(s)
        
    # Top Citizens
    top_citizens_cursor = users_collection.find(
        {"role": "citizen"},
        {"username": 1, "xp": 1, "level": 1, "badges": 1}
    ).sort("xp", -1).limit(3)
    
    top_citizens = []
    for c in top_citizens_cursor:
        c['_id'] = str(c['_id'])
        top_citizens.append(c)
    
    # --- DYNAMIC HALL OF FAME CALCULATIONS ---
    
    # 1. Top Solvers (Staff with most resolved complaints)
    # Credit goes to the Assigned Supervisor (Lead), not just the clicking Admin
    # --- DYNAMIC HALL OF FAME CALCULATIONS ---
    
    # 1. Top Solvers (Staff with most resolved complaints)
    # Credit goes to the Assigned Supervisor (Lead), not just the clicking Admin
    pipeline_solvers = [
        {"$match": {"status": "Resolved"}},
        # Lookup Supervisor details safely
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
        {"$unwind": {"path": "$supervisor_details", "preserveNullAndEmptyArrays": False}}, # Only count if supervisor exists
        {"$group": {
            "_id": "$supervisor_details.username",
            "role": {"$first": "$supervisor_details.role"},
            "count": {"$sum": 1},
            "avg_days": {"$avg": "$resolution_report.days_taken"}
        }},
        {"$sort": {"count": -1}},
        {"$limit": 3}
    ]
    top_solvers_data = list(complaints_collection.aggregate(pipeline_solvers))
    
    # 2. Efficiency Kings (Staff with fastest avg resolution time)
    pipeline_speed = [
        {"$match": {"status": "Resolved"}},
        # Lookup Supervisor details safely
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
        {"$match": {"count": {"$gte": 1}}}, # Min 1 for now
        {"$sort": {"avg_days": 1}},
        {"$limit": 3}
    ]
    efficiency_kings_data = list(complaints_collection.aggregate(pipeline_speed))
    
    # Construct Hall of Fame dictionary
    hall_of_fame = {
        "top_solvers": top_solvers_data,
        "efficiency_kings": efficiency_kings_data,
        "top_citizens": top_citizens
    }
    
    # Clean up _id to strings if needed (username is string so it's fine, but structure match)
    # The frontend expects: { _id: "Username", count: 10, ... }
    
    # --- NEW FEATURES: Department Health & Activity ---
    
    # 1. Department Health (Backlog Analysis)
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
    department_health = list(complaints_collection.aggregate(pipeline_dept))
    
    # 2. Live Recent Activity (Global Timeline)
    # We want the absolute latest events from ANY complaint
    pipeline_activity = [
        {"$project": {"timeline": 1, "title": 1, "_id": 1}},
        {"$unwind": "$timeline"},
        {"$sort": {"timeline.date": -1}}, # Latest first
        {"$limit": 7},
        {"$project": {
            "id": "$_id",
            "title": "$title",
            "action": "$timeline.status",
            "by": "$timeline.by",
            "note": "$timeline.note",
            "date": "$timeline.date"
        }}
    ]
    recent_activity = list(complaints_collection.aggregate(pipeline_activity))
    
    # Clean up ObjectIds and Dates for recent_activity
    # This prevents JSON serialization errors if custom encoder is not active
    for item in recent_activity:
        item['id'] = str(item['id']) # explicit id field
        if '_id' in item:
            item['_id'] = str(item['_id'])
        if 'date' in item and isinstance(item['date'], datetime.datetime):
            item['date'] = item['date'].isoformat()

    return jsonify({
        "total": total_complaints,
        "resolved": resolved,
        "pending": pending,
        "in_progress": in_progress,
        "high_priority": high_priority,
        "users": {
            "total": total_users,
            "staff": staff_count,
            "citizens": citizen_count
        },
        "gamification": {
            "total_system_xp": total_xp,
            "hall_of_fame": hall_of_fame,
            "top_citizens": top_citizens
        },
        "expanded_stats": {
            "department_health": department_health,
            "recent_activity": recent_activity
        }
    })

@app.route('/api/admin/analytics', methods=['GET'])
@token_required
def get_admin_analytics(current_user):
    # Mock data for trends (last 7 months)
    # In a real app, aggregation by month would go here
    trends = [
        {"name": "Jan", "actual": 45, "predicted": 50},
        {"name": "Feb", "actual": 52, "predicted": 48},
        {"name": "Mar", "actual": 48, "predicted": 55},
        {"name": "Apr", "actual": 61, "predicted": 60},
        {"name": "May", "actual": 55, "predicted": 58},
        {"name": "Jun", "actual": 67, "predicted": 65},
        {"name": "Jul", "actual": 72, "predicted": 70},
    ]

    # AI Insights (Mock or Real)
    alerts = [
        {"msg": "High complaint volume predicted for 'Water' sector next week."}
    ]

    return jsonify({
        "trends": trends,
        "alerts": alerts
    })

@app.route('/api/notifications', methods=['GET'])
@token_required
def get_notifications(current_user):
    # Fetch notifications for the user
    notifs = list(notifications_collection.find({"user_id": str(current_user['_id'])}).sort("created_at", -1).limit(10))
    
    # Serialize
    for n in notifs:
        n['_id'] = str(n['_id'])
        if 'created_at' in n:
            n['created_at'] = n['created_at'].isoformat()
            
    return jsonify(notifs)

@app.route('/api/leaderboard', methods=['GET'])
def get_leaderboard():
    try:
        # Get top 10 verified citizens sorted by XP
        top_users = users_collection.find(
            {"role": "citizen", "is_verified": True},
            {"username": 1, "xp": 1, "badge": 1, "profile_photo": 1, "level": 1}
        ).sort("xp", -1).limit(10)
        
        leaderboard = []
        for user in top_users:
            user['_id'] = str(user['_id'])
            leaderboard.append(user)
            
        return jsonify(leaderboard)
    except Exception as e:
        return jsonify({"message": "Error fetching leaderboard"}), 500



@app.route('/api/notifications/<id>/read', methods=['PUT'])
@token_required
def read_notification(current_user, id):
    try:
        notifications_collection.update_one(
            {"_id": ObjectId(id), "user_id": str(current_user['_id'])},
            {"$set": {"read": True}}
        )
        return jsonify({"message": "Marked as read"})
    except:
        return jsonify({"message": "Error"}), 500



# --- Contact / Inquiry Routes ---
@app.route('/api/contact', methods=['POST'])
def submit_contact_form():
    data = request.get_json()
    
    # Basic Validation
    if not data.get('name') or not data.get('email') or not data.get('message'):
        return jsonify({"message": "Name, Email, and Message are required"}), 400
        
    new_inquiry = Inquiry(
        name=data['name'],
        email=data['email'],
        subject=data.get('subject', 'General Inquiry'),
        message=data['message']
    )
    
    try:
        db.inquiries.insert_one(new_inquiry.to_dict())
        
        # Notify Admins
        admins = users_collection.find({"role": "admin"})
        for admin in admins:
            notifications_collection.insert_one(Notification(
                user_id=str(admin['_id']),
                title="New Inquiry Received 📩",
                message=f"New inquiry from {data['name']}: {data.get('subject', 'No Subject')}",
                type="info"
            ).to_dict())
            
        return jsonify({"message": "Inquiry submitted successfully"}), 201
    except Exception as e:
        print(f"Error submitting inquiry: {e}")
        return jsonify({"message": "Failed to submit inquiry"}), 500

@app.route('/api/admin/inquiries', methods=['GET'])
@token_required
def get_inquiries(current_user):
    if current_user['role'] != 'admin':
        return jsonify({"message": "Unauthorized"}), 403
        
    inquiries = list(db.inquiries.find().sort("created_at", -1))
    for i in inquiries:
        i['_id'] = str(i['_id'])
        
    return jsonify(inquiries)

@app.route('/api/admin/inquiries/<id>/reply', methods=['POST'])
@token_required
def reply_to_inquiry(current_user, id):
    if current_user['role'] != 'admin':
        return jsonify({"message": "Unauthorized"}), 403
        
    data = request.get_json()
    reply_message = data.get('reply')
    
    if not reply_message:
        return jsonify({"message": "Reply message is required"}), 400
        
    try:
        inquiry = db.inquiries.find_one({"_id": ObjectId(id)})
        if not inquiry:
            return jsonify({"message": "Inquiry not found"}), 404
            
        # Update Inquiry
        db.inquiries.update_one(
            {"_id": ObjectId(id)},
            {"$set": {
                "status": "Replied",
                "reply": reply_message,
                "replied_at": datetime.datetime.utcnow(),
                "replied_by": current_user['username']
            }}
        )
        
        # Send Email to User
        try:
            msg = Message(f"Re: {inquiry['subject']}", recipients=[inquiry['email']])
            msg.body = f"Dear {inquiry['name']},\n\n{reply_message}\n\nBest regards,\nCiviCare Support Team"
            mail.send(msg)
        except Exception as e:
            print(f"Error sending reply email: {e}")
            # We still return success as the DB was updated, but maybe warn?
            
        return jsonify({"message": "Reply sent successfully"}), 200
        
    except Exception as e:
        print(f"Error replying to inquiry: {e}")
        return jsonify({"message": "Failed to send reply"}), 500


# --- CiviBot Chatbot Endpoint (Public - No Auth Required) ---
from ai_module import chatbot_response as _chatbot_response

@app.route('/api/chatbot', methods=['POST'])
def chatbot():
    """
    Public chatbot endpoint. 
    Optionally reads the Authorization header to inject user context.
    """
    data = request.get_json(force=True) or {}
    message = data.get('message', '').strip()
    history = data.get('history', [])

    if not message:
        return jsonify({"reply": "Please type a message.", "quick_replies": [], "action": None}), 200

    # Optionally resolve current user from token (if provided)
    current_user = None
    auth_header = request.headers.get('Authorization', '')
    if auth_header.startswith('Bearer '):
        try:
            token = auth_header.split(' ')[1]
            decoded = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
            current_user = users_collection.find_one({"_id": ObjectId(decoded['user_id'])})
        except Exception:
            pass  # Token invalid/expired — treat as guest

    result = _chatbot_response(message, history=history, user=current_user)
    return jsonify(result), 200


if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    app.run(debug=True, host='0.0.0.0', port=port)
