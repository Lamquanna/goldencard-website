# Script to add Firebase environment variables to Vercel
# Run this script: .\scripts\setup-vercel-env.ps1

Write-Host "Adding Firebase Environment Variables to Vercel..." -ForegroundColor Green

$envVars = @{
    "NEXT_PUBLIC_FIREBASE_API_KEY" = "AIzaSyBJQrhYBKPTpomR_FTbh33NglD8THJkiic"
    "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN" = "goldenenergy-bead9.firebaseapp.com"
    "NEXT_PUBLIC_FIREBASE_PROJECT_ID" = "goldenenergy-bead9"
    "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET" = "goldenenergy-bead9.firebasestorage.app"
    "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID" = "343432638836"
    "NEXT_PUBLIC_FIREBASE_APP_ID" = "1:343432638836:web:8502db00136985ce753c21"
    "NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID" = "G-M4PXZTDFGM"
}

foreach ($key in $envVars.Keys) {
    $value = $envVars[$key]
    Write-Host "`nAdding $key..." -ForegroundColor Yellow
    
    # Add to Production
    Write-Host $value | vercel env add $key production
    
    # Add to Preview
    Write-Host $value | vercel env add $key preview
    
    # Add to Development
    Write-Host $value | vercel env add $key development
}

Write-Host "`n✅ All environment variables added!" -ForegroundColor Green
Write-Host "Now run: vercel --prod" -ForegroundColor Cyan
