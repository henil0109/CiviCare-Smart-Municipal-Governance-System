# Daily Contribution Automation Script
# Developer: HENIL PATEL

$GitPath = "C:\Program Files\Git\cmd\git.exe"
$LogFile = "activity.log"
$Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"

# Add entry to log file
Add-Content -Path $LogFile -Value "Contribution entry: $Timestamp"

# Git operations
& $GitPath add $LogFile
& $GitPath commit -m "Daily contribution: $Timestamp"
& $GitPath push origin main

Write-Host "Daily contribution successful: $Timestamp" -ForegroundColor Green
