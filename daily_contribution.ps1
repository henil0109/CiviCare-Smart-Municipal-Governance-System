# Daily Contribution Automation Script
# Developer: HENIL PATEL

$GitPath = "git" # Assuming git is in PATH, otherwise use full path
$LogFile = "activity.log"
$Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"

# Function to log local activity
function Write-Log($Message) {
    $LogEntry = "[$Timestamp] $Message"
    Add-Content -Path $LogFile -Value $LogEntry
    Write-Host $Message
}

try {
    # Navigate to project directory (optional if run from here, but good for Task Scheduler)
    Set-Location -Path "d:\BTECH_CSE\3 YEAR\6 sem\SGP"

    Write-Log "Starting daily contribution..."

    # Pull latest changes to avoid conflicts
    & $GitPath pull origin master

    # Add entry to log file to ensure at least one change
    Add-Content -Path $LogFile -Value "Daily heartbeat: $Timestamp"

    # Stage all changes
    & $GitPath add .

    # Commit
    & $GitPath commit -m "Daily contribution: $Timestamp"

    # Push
    $PushResult = & $GitPath push origin master 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Log "Error during push: $PushResult"
    } else {
        Write-Log "Daily contribution successful!"
    }
} catch {
    Write-Log "Critical error: $($_.Exception.Message)"
}
