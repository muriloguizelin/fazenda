# Create backups directory if it doesn't exist
$backupDir = "backups"
if (-not (Test-Path $backupDir)) {
    New-Item -ItemType Directory -Path $backupDir | Out-Null
}

# Get the container ID for the database service
$containerId = docker compose ps -q db

if (-not $containerId) {
    Write-Host "Error: Database container not found. Is docker compose running?" -ForegroundColor Red
    exit 1
}

# Generate timestamp
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$backupFile = "$backupDir\backup_$timestamp.sql"

# Run pg_dump
Write-Host "Creating backup of 'fazenda' database..." -ForegroundColor Cyan

# We use cmd /c to handle the redirection properly
cmd /c "docker exec -t $containerId pg_dump -U app fazenda > $backupFile"

if ($LASTEXITCODE -eq 0) {
    Write-Host "Backup created successfully: $backupFile" -ForegroundColor Green
} else {
    Write-Host "Backup failed!" -ForegroundColor Red
    Remove-Item $backupFile -ErrorAction SilentlyContinue
}
