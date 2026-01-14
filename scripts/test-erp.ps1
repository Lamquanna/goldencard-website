# ERP Testing Script - Đảm bảo server chạy trước khi test
# Usage: .\scripts\test-erp.ps1 [module]
# Examples:
#   .\scripts\test-erp.ps1          # Test tất cả ERP modules
#   .\scripts\test-erp.ps1 login    # Chỉ test ERP login
#   .\scripts\test-erp.ps1 dashboard # Chỉ test ERP dashboard

param(
    [string]$Module = "all"
)

Write-Host "🧪 ERP Testing Script" -ForegroundColor Cyan
Write-Host "===================`n" -ForegroundColor Cyan

# 1. Check if dev server is running
Write-Host "🔍 Checking dev server..." -ForegroundColor Yellow
$serverRunning = $false

try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -TimeoutSec 2 -ErrorAction Stop
    $serverRunning = $true
    Write-Host "✅ Server is already running!" -ForegroundColor Green
} catch {
    Write-Host "⚠ Server is not running. Starting it now..." -ForegroundColor Yellow
    
    # Start server in background
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'C:\Users\ADM\goldencard-website'; npm run dev" -WindowStyle Minimized
    
    Write-Host "⏳ Waiting for server to start (30 seconds)..." -ForegroundColor Yellow
    Start-Sleep -Seconds 30
    
    # Verify server is up
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop
        Write-Host "✅ Server started successfully!" -ForegroundColor Green
        $serverRunning = $true
    } catch {
        Write-Host "❌ Server failed to start. Please start manually: npm run dev" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""

# 2. Run appropriate tests
Write-Host "🧪 Running ERP tests for: $Module" -ForegroundColor Cyan

switch ($Module.ToLower()) {
    "login" {
        Write-Host "Testing ERP Login System..." -ForegroundColor Yellow
        npm run test:erp:login
    }
    "dashboard" {
        Write-Host "Testing ERP Dashboard..." -ForegroundColor Yellow
        npm run test:erp:dashboard
    }
    "attendance" {
        Write-Host "Testing ERP Attendance..." -ForegroundColor Yellow
        npm run test:erp:attendance
    }
    "projects" {
        Write-Host "Testing ERP Projects..." -ForegroundColor Yellow
        npm run test:erp:projects
    }
    "users" {
        Write-Host "Testing ERP Users..." -ForegroundColor Yellow
        npm run test:erp:users
    }
    "comprehensive" {
        Write-Host "Testing ERP System-wide..." -ForegroundColor Yellow
        npm run test:erp:all
    }
    "all" {
        Write-Host "Testing ALL ERP Modules..." -ForegroundColor Yellow
        npm run test:erp:all
    }
    default {
        Write-Host "Unknown module: $Module" -ForegroundColor Red
        Write-Host "Valid modules: login, dashboard, attendance, projects, users, comprehensive, all" -ForegroundColor Yellow
        exit 1
    }
}

Write-Host "`n✅ ERP Testing complete!" -ForegroundColor Green
