# Quick smoke test before deploy
Write-Host "🧪 Running Quick Smoke Tests..." -ForegroundColor Cyan
Write-Host "This will take about 2-3 minutes`n" -ForegroundColor Gray

# Check if server is running
$serverRunning = $false
try {
    $null = Invoke-WebRequest -Uri "http://localhost:3000" -Method Head -TimeoutSec 2 -ErrorAction Stop
    $serverRunning = $true
} catch {
    Write-Host "⚠️  Local server not running. Starting dev server..." -ForegroundColor Yellow
    Start-Process npm -ArgumentList "run dev" -NoNewWindow
    Write-Host "⏳ Waiting for server to start (15 seconds)..." -ForegroundColor Gray
    Start-Sleep -Seconds 15
}

# Run smoke tests
Write-Host "🏃 Running smoke tests..." -ForegroundColor Cyan
npx playwright test tests/e2e/smoke.spec.ts --reporter=list

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ All smoke tests passed!" -ForegroundColor Green
    Write-Host "✅ Safe to deploy!" -ForegroundColor Green
    exit 0
} else {
    Write-Host "`n❌ Smoke tests failed!" -ForegroundColor Red
    Write-Host "❌ DO NOT DEPLOY - Fix issues first!" -ForegroundColor Red
    Write-Host "`nRun 'npm run test:debug' to debug issues" -ForegroundColor Yellow
    exit 1
}
