# Check application health
param(
    [string]$url = "http://localhost:3000"
)

Write-Host "🏥 Health Check for: $url" -ForegroundColor Cyan

$healthUrl = "$url/api/health"

try {
    $response = Invoke-RestMethod -Uri $healthUrl -Method Get -TimeoutSec 10
    
    Write-Host "`n📊 Health Status: " -NoNewline
    
    switch ($response.status) {
        "healthy" {
            Write-Host "✅ HEALTHY" -ForegroundColor Green
        }
        "degraded" {
            Write-Host "⚠️  DEGRADED" -ForegroundColor Yellow
        }
        "unhealthy" {
            Write-Host "❌ UNHEALTHY" -ForegroundColor Red
        }
        default {
            Write-Host "❓ UNKNOWN" -ForegroundColor Gray
        }
    }
    
    Write-Host "`n📈 Details:" -ForegroundColor Cyan
    Write-Host "  Timestamp: $($response.timestamp)" -ForegroundColor Gray
    Write-Host "  Uptime: $([math]::Round($response.uptime / 1000, 2)) seconds" -ForegroundColor Gray
    
    Write-Host "`n🔍 Component Checks:" -ForegroundColor Cyan
    foreach ($check in $response.checks.PSObject.Properties) {
        $status = if ($check.Value) { "✅" } else { "❌" }
        Write-Host "  $status $($check.Name): $($check.Value)" -ForegroundColor Gray
    }
    
    if ($response.memory) {
        Write-Host "`n💾 Memory Usage:" -ForegroundColor Cyan
        Write-Host "  Used: $($response.memory.used) MB" -ForegroundColor Gray
        Write-Host "  Total: $($response.memory.total) MB" -ForegroundColor Gray
        Write-Host "  Percentage: $($response.memory.percentage)%" -ForegroundColor Gray
    }
    
    Write-Host "`n✅ Health check complete!" -ForegroundColor Green
    
} catch {
    Write-Host "`n❌ Health check failed!" -ForegroundColor Red
    Write-Host "Error: $_" -ForegroundColor Red
    
    if ($_.Exception.Response) {
        Write-Host "Status Code: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Yellow
    }
    
    exit 1
}
