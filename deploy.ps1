# PowerShell script to deploy to Vercel with retry logic
$maxRetries = 3
$retryCount = 0
$deploySuccess = $false

while (-not $deploySuccess -and $retryCount -lt $maxRetries) {
    Write-Host "Deployment attempt $($retryCount + 1) of $maxRetries..." -ForegroundColor Cyan
    
    try {
        # Build the project first
        npm run build
        
        # Try to deploy
        vercel --prod --yes
        
        $deploySuccess = $LASTEXITCODE -eq 0
        
        if ($deploySuccess) {
            Write-Host "✅ Deployment successful!" -ForegroundColor Green
        }
    }
    catch {
        Write-Host "❌ Deployment failed: $_" -ForegroundColor Red
    }
    
    if (-not $deploySuccess) {
        $retryCount++
        if ($retryCount -lt $maxRetries) {
            Write-Host "⏳ Waiting 5 seconds before retry..." -ForegroundColor Yellow
            Start-Sleep -Seconds 5
        }
    }
}

if (-not $deploySuccess) {
    Write-Host "❌ All deployment attempts failed. Please check your network connection." -ForegroundColor Red
    exit 1
}
