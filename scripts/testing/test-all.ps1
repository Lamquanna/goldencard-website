# Run all tests
Write-Host "🧪 Running Full Test Suite" -ForegroundColor Cyan
Write-Host "This will take about 5-10 minutes`n" -ForegroundColor Gray

$failed = $false

# Step 1: Unit Tests
Write-Host "📦 Step 1/2: Running unit tests..." -ForegroundColor Yellow
npm run test:unit

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Unit tests failed!" -ForegroundColor Red
    $failed = $true
} else {
    Write-Host "✅ Unit tests passed!`n" -ForegroundColor Green
}

# Step 2: E2E Tests
Write-Host "🌐 Step 2/2: Running E2E tests..." -ForegroundColor Yellow

# Check if server is running
$serverRunning = $false
try {
    $null = Invoke-WebRequest -Uri "http://localhost:3000" -Method Head -TimeoutSec 2 -ErrorAction Stop
    $serverRunning = $true
} catch {
    Write-Host "⚠️  Starting dev server..." -ForegroundColor Yellow
    Start-Process npm -ArgumentList "run dev" -NoNewWindow
    Write-Host "⏳ Waiting for server (15 seconds)..." -ForegroundColor Gray
    Start-Sleep -Seconds 15
}

npm run test:e2e

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ E2E tests failed!" -ForegroundColor Red
    $failed = $true
} else {
    Write-Host "✅ E2E tests passed!`n" -ForegroundColor Green
}

# Summary
Write-Host "`n" + ("=" * 50) -ForegroundColor Gray
if ($failed) {
    Write-Host "❌ TEST SUITE FAILED" -ForegroundColor Red
    Write-Host "Some tests did not pass. Please review the output above." -ForegroundColor Yellow
    exit 1
} else {
    Write-Host "✅ ALL TESTS PASSED!" -ForegroundColor Green
    Write-Host "Your application is ready for deployment." -ForegroundColor Green
    exit 0
}
