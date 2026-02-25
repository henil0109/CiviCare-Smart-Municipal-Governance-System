# Setup Script for Daily Contribution Task
# This script creates a Windows Task Scheduler task that runs the daily_contribution.ps1 script on logon.

$TaskName = "CiviCareDailyContribution"
$ScriptPath = "d:\BTECH_CSE\3 YEAR\6 sem\SGP\daily_contribution.ps1"
$Action = New-ScheduledTaskAction -Execute "powershell.exe" -Argument "-ExecutionPolicy Bypass -WindowStyle Hidden -File `"$ScriptPath`""
$Trigger = New-ScheduledTaskTrigger -AtLogOn
$Settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable

# Check if task already exists and remove it
if (Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue) {
    Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false
}

Register-ScheduledTask -TaskName $TaskName -Action $Action -Trigger $Trigger -Settings $Settings -Description "Automated GitHub contributions for CiviCare project on logon."

Write-Host "Task '$TaskName' has been created successfully." -ForegroundColor Green
Write-Host "It will run every time you log into your computer." -ForegroundColor Cyan
