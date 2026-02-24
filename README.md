# CiviCare - Smart Municipal Governance System
**Developer: HENIL PATEL**

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
