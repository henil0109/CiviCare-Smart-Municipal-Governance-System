$ErrorActionPreference = "Stop"
Write-Host "Starting CiviCare Server..."
& "$PSScriptRoot\venv\Scripts\python.exe" "$PSScriptRoot\broadcast_server.py"
