# Find broken links and buttons
param(
    [string]$url = "http://localhost:3000"
)

Write-Host "🔍 Scanning for broken elements on: $url" -ForegroundColor Cyan
Write-Host ""

# Check if server is running
try {
    $null = Invoke-WebRequest -Uri $url -Method Head -TimeoutSec 5 -ErrorAction Stop
} catch {
    Write-Host "❌ Server is not running at $url" -ForegroundColor Red
    Write-Host "Start your dev server with: npm run dev" -ForegroundColor Yellow
    exit 1
}

# Run specific tests
Write-Host "🔘 Checking buttons..." -ForegroundColor Yellow
npx playwright test tests/e2e/smoke.spec.ts --grep "broken buttons" --reporter=list

Write-Host "`n🔗 Checking navigation links..." -ForegroundColor Yellow
npx playwright test tests/e2e/smoke.spec.ts --grep "navigation links" --reporter=list

Write-Host "`n📋 Checking forms..." -ForegroundColor Yellow
npx playwright test tests/e2e/smoke.spec.ts --grep "forms" --reporter=list

Write-Host "`n🖼️  Checking resources..." -ForegroundColor Yellow
npx playwright test tests/e2e/smoke.spec.ts --grep "404 resources" --reporter=list

Write-Host "`n✅ Scan complete!" -ForegroundColor Green
Write-Host "Check output above for any failures." -ForegroundColor Gray
