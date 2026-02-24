# How to Share Your Local Server Publicly

This guide explains how to expose your local CiviCare website to the public internet so you can:
1.  Share a link with others (e.g., `https://civicare-demo.loca.lt`).
2.  Test on mobile data (4G/5G).
3.  Allow anyone anywhere to access the site.

## 🚀 Quick Start (No Install Required)

We will use a free tool called **LocalTunnel** which requires no passwords or accounts.

### Step 1: Start Your Backend & Frontend
Make sure your servers are running as usual:
1.  **Backend**: `.\start_server.ps1` (or `python broadcast_server.py`)
2.  **Frontend**: `npm run dev`

### Step 2: Run the Sharing Script
Open a **new terminal** in the `SGP` folder and run:
```powershell
.\expose_public.ps1
```

### Step 3: Get Your Public URL
The script will output a URL like:
`https://shiny-pugs-sing.loca.lt`

1.  Copy this URL.
2.  **IMPORTANT:** On the first visit, LocalTunnel might ask for a password. The script will show you this password (it's your public IP).
3.  Share this link!

## ⚠️ Important Note for Email Verification

When using the **Public Link**, the email verification system *might still send links pointing to your Local WiFi IP* (because the server doesn't know about the tunnel).

**To fix this for a public demo:**
1.  Open `server/.env`.
2.  Manually change `CLIENT_URL` to your tunnel URL (e.g., `CLIENT_URL=https://shiny-pugs-sing.loca.lt`).
3.  Restart the backend server.
4.  Now email links will work for public users too!
