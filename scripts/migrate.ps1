# Database Migration Script for Golden Energy Analytics
# Run this script to create all analytics tables

Write-Host "🚀 Golden Energy Analytics - Database Migration" -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Cyan

# Check if .env.local exists
if (-not (Test-Path ".env.local")) {
    Write-Host "❌ Error: .env.local file not found!" -ForegroundColor Red
    Write-Host "Please create .env.local with POSTGRES_URL or POSTGRES_URL_NON_POOLING" -ForegroundColor Yellow
    exit 1
}

# Load environment variables
Write-Host "📋 Loading environment variables..." -ForegroundColor Yellow
Get-Content .env.local | ForEach-Object {
    if ($_ -match '^([^=]+)=(.*)$') {
        [System.Environment]::SetEnvironmentVariable($matches[1], $matches[2], 'Process')
    }
}

# Check if database URL is set
$dbUrl = [System.Environment]::GetEnvironmentVariable('POSTGRES_URL', 'Process')
$dbUrlNonPooling = [System.Environment]::GetEnvironmentVariable('POSTGRES_URL_NON_POOLING', 'Process')

if (-not $dbUrl -and -not $dbUrlNonPooling) {
    Write-Host "❌ Error: No database URL found in environment!" -ForegroundColor Red
    Write-Host "Please set POSTGRES_URL or POSTGRES_URL_NON_POOLING in .env.local" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Database URL found" -ForegroundColor Green

# Run migration
Write-Host "`n🔄 Running migration script..." -ForegroundColor Cyan
node scripts/migrate.js

Write-Host "`n✨ Migration process completed!" -ForegroundColor Green
Write-Host "=" * 60 -ForegroundColor Cyan
