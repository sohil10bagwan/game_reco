# PowerShell script to move all files from src/ to root
# Run this in your terminal, then commit and push to GitHub

Write-Host "Moving files from src/ to root..." -ForegroundColor Cyan

# Move all files and folders from src to root
Get-ChildItem -Path ".\src" -Force | ForEach-Object {
    $destination = Join-Path "." $_.Name
    Write-Host "Moving $($_.Name) to $destination" -ForegroundColor Yellow
    Move-Item -Path $_.FullName -Destination $destination -Force
}

# Remove empty src folder
Remove-Item -Path ".\src" -Recurse -Force
Write-Host "Removed empty src/ folder" -ForegroundColor Green

Write-Host "`n✅ All files moved successfully!" -ForegroundColor Green
Write-Host "`nNow run these commands:" -ForegroundColor Cyan
Write-Host "  git add ." -ForegroundColor White
Write-Host "  git commit -m 'Fix: Move all files to root for Render deployment'" -ForegroundColor White
Write-Host "  git push origin main" -ForegroundColor White
