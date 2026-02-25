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
    # Navigate to project directory
    Set-Location -Path "d:\BTECH_CSE\3 YEAR\6 sem\SGP"

    Write-Log "Starting daily step-wise contribution..."

    # 1. Pull latest changes
    & $GitPath pull origin master

    # 2. Add heartbeat to log file
    Write-Log "Adding daily heartbeat..."
    Add-Content -Path $LogFile -Value "Daily heartbeat: $Timestamp"

    # 3. Get list of modified and untracked files
    $files = & $GitPath status --short
    
    if ($files) {
        foreach ($line in $files) {
            # Extract filename from status line (e.g., " M daily_contribution.ps1" -> "daily_contribution.ps1")
            $file = $line.Substring(3).Trim()
            if ($file) {
                Write-Log "Committing change: $file"
                & $GitPath add "$file"
                & $GitPath commit -m "Update $file - $Timestamp"
            }
        }
    } else {
        # Fallback heartbeat if no files changed (unlikely with log update)
        & $GitPath add "$LogFile"
        & $GitPath commit -m "Daily heartbeat - $Timestamp"
    }

    # 4. Push all commits
    Write-Log "Pushing all changes to origin..."
    $PushResult = & $GitPath push origin master 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Log "Error during push: $PushResult"
    } else {
        Write-Log "Step-wise contribution successful!"
    }
} catch {
    Write-Log "Critical error: $($_.Exception.Message)"
}
