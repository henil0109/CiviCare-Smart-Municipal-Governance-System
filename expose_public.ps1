Write-Host "--- CiviCare Public Sharing Tool ---" -ForegroundColor Cyan
Write-Host "This tool will generate a Public URL for your local website."
Write-Host "Make sure your React Frontend (port 5173) is running first!" -ForegroundColor Yellow
Write-Host ""

# Check if npx is available
if (-not (Get-Command "npx" -ErrorAction SilentlyContinue)) {
    Write-Error "Node.js (npx) is not installed. Please install Node.js first."
    exit
}

Write-Host "1. Getting your Tunnel Password (Public IP)..." -ForegroundColor Green
# Fetch public IP for the localtunnel password protection
try {
    $publicIP = (Invoke-WebRequest -Uri "https://loca.lt/mytunnelpassword" -UseBasicParsing).Content.Trim()
    Write-Host "👉 YOUR PASSWORD IS: $publicIP" -ForegroundColor Magenta -BackgroundColor Black
    Write-Host "(You will need to enter this password when you open the link first time)" -ForegroundColor Gray
} catch {
    Write-Host "Could not fetch password automatically. You might not need it." -ForegroundColor DarkGray
}

Write-Host ""
Write-Host "2. Starting Tunnel..." -ForegroundColor Green
Write-Host "Press Ctrl+C to stop sharing." -ForegroundColor Yellow

# Start localtunnel for port 5173
npx localtunnel --port 5173
