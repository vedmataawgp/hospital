# dev.ps1 - Automated setup and run for MediCare Hospital

Write-Host "Checking for uv..." -ForegroundColor Cyan
if (!(Get-Command uv -ErrorAction SilentlyContinue)) {
    # Try common Windows Python AppData paths
    $uvBinPath = Get-ChildItem -Path "$HOME\AppData\Local\Packages\PythonSoftwareFoundation.Python.*\LocalCache\local-packages\Python*\Scripts\uv.exe" -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($uvBinPath) {
        $env:PATH += ";$($uvBinPath.DirectoryName)"
        Write-Host "Found uv.exe in LocalCache, added to temporary PATH." -ForegroundColor Yellow
    } else {
        Write-Host "uv not found, installing via pip..." -ForegroundColor Yellow
        pip install uv
        # Try again after installation
        $uvBinPath = Get-ChildItem -Path "$HOME\AppData\Local\Packages\PythonSoftwareFoundation.Python.*\LocalCache\local-packages\Python*\Scripts\uv.exe" -ErrorAction SilentlyContinue | Select-Object -First 1
        if ($uvBinPath) { $env:PATH += ";$($uvBinPath.DirectoryName)" }
    }
}
if (!(Get-Command uv -ErrorAction SilentlyContinue)) {
    Write-Host "Error: uv is not in your PATH. Please restart your PowerShell window." -ForegroundColor Red
    exit 1
}

Write-Host "Setting up backend..." -ForegroundColor Cyan
Set-Location "artifacts/api-server"
uv pip install -r requirements.txt
uv run python manage.py migrate
Get-Content seed_users.py | uv run python manage.py shell
Start-Process powershell -ArgumentList "-NoExit", "-Command", "uv run python manage.py runserver 0.0.0.0:8080"
Write-Host "Backend server started in a new PowerShell window on port 8080." -ForegroundColor Green

Write-Host "Setting up frontend..." -ForegroundColor Cyan
Set-Location "../../frontend"
npm install
npm run dev
