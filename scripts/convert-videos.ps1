# Script chuyển đổi video sang định dạng tối ưu
# Yêu cầu: Cài đặt ffmpeg (winget install ffmpeg)

Write-Host "🎬 Bắt đầu chuyển đổi video banners..." -ForegroundColor Cyan

$videos = @(
    "public/Video Banner/Head Banner.mp4",
    "public/Video Banner/Middle Banner.mp4"
)

foreach ($video in $videos) {
    $videoPath = Join-Path $PSScriptRoot "..\$video"
    
    if (-not (Test-Path $videoPath)) {
        Write-Host "❌ Không tìm thấy: $video" -ForegroundColor Red
        continue
    }
    
    $outputWebm = $videoPath -replace '.mp4', '.webm'
    $outputPoster = $videoPath -replace '.mp4', '-poster.jpg'
    
    Write-Host "`n📹 Đang xử lý: $video" -ForegroundColor Yellow
    
    # Tạo WebM (nhỏ hơn 40-50%)
    Write-Host "  ➜ Tạo WebM version..." -ForegroundColor Gray
    ffmpeg -i $videoPath -c:v libvpx-vp9 -crf 33 -b:v 0 `
           -vf "scale='min(1920,iw)':'-1'" `
           -c:a libopus -b:a 128k `
           -deadline good -cpu-used 4 `
           -row-mt 1 -threads 8 `
           -y $outputWebm 2>&1 | Out-Null
    
    if ($LASTEXITCODE -eq 0) {
        $originalSize = (Get-Item $videoPath).Length / 1MB
        $webmSize = (Get-Item $outputWebm).Length / 1MB
        $savings = (($originalSize - $webmSize) / $originalSize * 100)
        Write-Host "  ✅ WebM: {0:N2} MB → {1:N2} MB (tiết kiệm {2:N0}%)" -f $originalSize, $webmSize, $savings -ForegroundColor Green
    } else {
        Write-Host "  ❌ Lỗi tạo WebM" -ForegroundColor Red
    }
    
    # Tạo poster image (thumbnail)
    Write-Host "  ➜ Tạo poster image..." -ForegroundColor Gray
    ffmpeg -i $videoPath -vframes 1 -vf "scale='min(1920,iw)':'-1'" `
           -q:v 2 -y $outputPoster 2>&1 | Out-Null
    
    if ($LASTEXITCODE -eq 0) {
        $posterSize = (Get-Item $outputPoster).Length / 1KB
        Write-Host "  ✅ Poster: {0:N0} KB" -f $posterSize -ForegroundColor Green
    } else {
        Write-Host "  ❌ Lỗi tạo poster" -ForegroundColor Red
    }
}

Write-Host "`n✅ Hoàn thành! Đã tạo WebM versions và poster images." -ForegroundColor Green
Write-Host "📝 Lưu ý: Giữ lại file .mp4 gốc làm fallback cho Safari." -ForegroundColor Yellow
