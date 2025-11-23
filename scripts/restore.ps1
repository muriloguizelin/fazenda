param (
    [string]$BackupFile
)

# Get the container ID
$containerId = docker compose ps -q db

if (-not $containerId) {
    Write-Host "Error: Database container not found. Is docker compose running?" -ForegroundColor Red
    exit 1
}

# If no file specified, list recent backups
if (-not $BackupFile) {
    $backups = Get-ChildItem "backups\*.sql" | Sort-Object LastWriteTime -Descending
    if ($backups.Count -eq 0) {
        Write-Host "No backups found in backups directory." -ForegroundColor Yellow
        exit 1
    }
    
    Write-Host "Available backups:" -ForegroundColor Cyan
    for ($i = 0; $i -lt $backups.Count; $i++) {
        Write-Host "[$i] $($backups[$i].Name) ($($backups[$i].LastWriteTime))"
    }
    
    $selection = Read-Host "Select backup number to restore (0-$($backups.Count - 1))"
    if ($selection -match "^\d+$" -and $selection -lt $backups.Count) {
        $BackupFile = $backups[$selection].FullName
    } else {
        Write-Host "Invalid selection." -ForegroundColor Red
        exit 1
    }
}

Write-Host "WARNING: This will overwrite the current database with $BackupFile" -ForegroundColor Yellow
$confirm = Read-Host "Are you sure? (y/N)"
if ($confirm -ne 'y') {
    exit
}

Write-Host "Restoring database..." -ForegroundColor Cyan

# Drop and recreate schema to ensure clean slate
Write-Host "Cleaning existing data..."
cmd /c "docker exec -i $containerId psql -U app -d fazenda -c ""DROP SCHEMA public CASCADE; CREATE SCHEMA public;"""

# Restore
Write-Host "Importing data..."
cmd /c "type $BackupFile | docker exec -i $containerId psql -U app -d fazenda"

if ($LASTEXITCODE -eq 0) {
    Write-Host "Restore completed successfully." -ForegroundColor Green
} else {
    Write-Host "Restore failed." -ForegroundColor Red
}
