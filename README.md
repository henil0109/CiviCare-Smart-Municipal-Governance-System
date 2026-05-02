# CiviCare - Smart Municipal Governance System

CiviCare is an intelligent, transparent, and gamified digital platform designed to bridge the gap between citizens and municipal authorities. By leveraging AI to automate the triaging of civic complaints, CiviCare streamlines municipal reporting, ensures rapid response to critical issues, and fosters active civic participation.

## 👨‍💻 Developed By

**HENIL PATEL**
- **Roles:** System Architect, AI Integrator, Full Stack Development
- **GitHub:** [HENIL-01](https://github.com/HENIL-01)

**MEET PATEL**
- **Roles:** Frontend Development, UI/UX Designer, Documentation
- **GitHub:** [Meet5099](https://github.com/Meet5099)

---

## 🚀 Key Features
1. **Automated AI Triage:** AI engine categorizes issues, predicts priority, and estimates resolution time and costs.
2. **Role-Based Access Control:** Dedicated dashboards for Citizens, Supervisors, and Admins.
3. **CiviBot AI Assistant:** A 24/7 floating AI assistant to guide users and answer FAQs.
4. **Civic Gamification:** Users earn XP and Badges for active participation.
5. **Real-Time Tracking:** Citizens can track the status and timeline of their complaints.

## 🛠️ Technology Stack
- **Frontend:** React.js (Vite), Tailwind CSS, Framer Motion
- **Backend:** Python (Flask), JWT Authentication, Werkzeug
- **Database:** MongoDB (PyMongo)
- **External APIs:** Brevo (Transactional Emails)

---

## Prerequisites
- **Node.js** (v18+)
- **Python** (v3.10+)
- **MongoDB**: You MUST have access to a MongoDB instance.
  - **Local**: Install MongoDB Community Server and run it.
  - **Cloud**: Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/atlas/database).

## Installation & Setup

### 1. Backend (Flask)
Open a terminal in the `server` directory:
```bash
cd server
# Create virtual environment
python -m venv venv
# Activate it
# Windows: venv\Scripts\activate
# Mac/Linux: source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run the server
# (Default connects to mongodb://localhost:27017/civicare_db)
python app.py
```
*To use MongoDB Atlas, set the environment variable `MONGO_URI` before running.*

### 2. Frontend (React + Vite)
Open a NEW terminal in the `client` directory:
```bash
cd client

# Install dependencies
npm install

# Run the development server
npm run dev
```
*Frontend will run at `http://localhost:5173`*
