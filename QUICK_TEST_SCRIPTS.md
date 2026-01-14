# ⚡ QUICK TEST SCRIPTS

## Shortcut Commands

Thêm vào `package.json`:

```json
{
  "scripts": {
    "test": "npm run test:unit && npm run test:e2e",
    "test:quick": "playwright test tests/e2e/smoke.spec.ts",
    "test:smoke": "playwright test tests/e2e/smoke.spec.ts",
    "test:api": "playwright test tests/e2e/api-health.spec.ts",
    "test:homepage": "playwright test tests/e2e/homepage.spec.ts",
    "test:erp": "playwright test tests/e2e/erp-login.spec.ts",
    "test:ui": "playwright test --ui",
    "test:debug": "playwright test --debug",
    "test:headed": "playwright test --headed",
    "test:report": "playwright show-report tests/e2e-report",
    "check:health": "curl http://localhost:3000/api/health",
    "check:health:prod": "curl https://goldencard-website.vercel.app/api/health"
  }
}
```

## PowerShell Scripts

### test-quick.ps1
```powershell
# Quick smoke test before deploy
Write-Host "🧪 Running Quick Tests..." -ForegroundColor Cyan

# Run smoke tests
npm run test:smoke

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ All tests passed! Safe to deploy." -ForegroundColor Green
} else {
    Write-Host "❌ Tests failed! Do not deploy." -ForegroundColor Red
    exit 1
}
```

### check-health.ps1
```powershell
# Check application health
$url = "http://localhost:3000/api/health"

Write-Host "🏥 Checking health: $url" -ForegroundColor Cyan

try {
    $response = Invoke-RestMethod -Uri $url -Method Get
    
    if ($response.status -eq "healthy") {
        Write-Host "✅ Application is healthy" -ForegroundColor Green
        Write-Host "Uptime: $($response.uptime)ms" -ForegroundColor Gray
    } else {
        Write-Host "⚠️  Application status: $($response.status)" -ForegroundColor Yellow
    }
    
    $response | ConvertTo-Json
} catch {
    Write-Host "❌ Health check failed: $_" -ForegroundColor Red
    exit 1
}
```

### test-all.ps1
```powershell
# Run all tests
Write-Host "🧪 Running Full Test Suite..." -ForegroundColor Cyan

# Unit tests
Write-Host "`n📦 Running unit tests..." -ForegroundColor Yellow
npm run test:unit

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Unit tests failed!" -ForegroundColor Red
    exit 1
}

# E2E tests
Write-Host "`n🌐 Running E2E tests..." -ForegroundColor Yellow
npm run test:e2e

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ E2E tests failed!" -ForegroundColor Red
    exit 1
}

Write-Host "`n✅ All tests passed!" -ForegroundColor Green
```

### find-broken-buttons.ps1
```powershell
# Find broken buttons on a page
param(
    [string]$url = "http://localhost:3000"
)

Write-Host "🔍 Checking for broken buttons on: $url" -ForegroundColor Cyan

npx playwright test --grep "broken buttons" --headed

Write-Host "✅ Check complete" -ForegroundColor Green
```

## Usage

### Windows (PowerShell)
```powershell
# Make scripts executable (one time)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Run quick test
.\scripts\test-quick.ps1

# Check health
.\scripts\check-health.ps1

# Run all tests
.\scripts\test-all.ps1
```

### Linux/Mac (Bash)
```bash
# Make scripts executable
chmod +x scripts/*.sh

# Run quick test
./scripts/test-quick.sh

# Check health
./scripts/check-health.sh
```
