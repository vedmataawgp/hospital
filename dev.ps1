# dev.ps1 — Start both backend and frontend for MediCare Hospital
# Standardised to use the root virtual environment and uv (if available).

$RepoRoot = Split-Path -Parent $MyInvocation.MyCommand.Definition
$BackendDir = Join-Path $RepoRoot "artifacts\api-server"
$FrontendDir = Join-Path $RepoRoot "frontend"

# 1. Environment consolidation: Ensure no redundant venv inside backend
If (Test-Path "$BackendDir\.venv") {
    Write-Host "[0/4] Removing redundant backend virtual environment..." -ForegroundColor Yellow
    Remove-Item -Path "$BackendDir\.venv" -Force -Recurse -ErrorAction SilentlyContinue
}

# 2. Check for uv and setup environment
Write-Host "[1/4] Preparing Python environment..." -ForegroundColor Cyan
$PythonCmd = "python"
If (Get-Command uv -ErrorAction SilentlyContinue) {
    Write-Host "      Using uv $(uv --version)" -ForegroundColor Green
    $PythonCmd = "uv run python"
} Else {
    Write-Host "      uv not found in PATH, using standard python from .venv" -ForegroundColor Yellow
    $VenvPython = Join-Path $RepoRoot ".venv\Scripts\python.exe"
    If (Test-Path $VenvPython) {
        $PythonCmd = $VenvPython
    }
}

# 3. Run migrations and seeds
Write-Host "[2/4] Running Django migrations..." -ForegroundColor Cyan
Set-Location $BackendDir
Invoke-Expression "$PythonCmd manage.py migrate --no-input"

Write-Host "[3/4] Seeding initial users..." -ForegroundColor Cyan
Get-Content seed_users.py | Invoke-Expression "$PythonCmd manage.py shell"

Write-Host ""
Write-Host "  Backend  → http://localhost:8080" -ForegroundColor White
Write-Host "  Frontend → http://localhost:5000" -ForegroundColor White
Write-Host ""

# 4. Starting services (Non-blocking backend)
Write-Host "[4/4] Starting backend in a new window (port 8080)..." -ForegroundColor Cyan
$StartArgs = "-NoExit", "-Command", "Set-Location '$BackendDir'; $PythonCmd manage.py runserver 0.0.0.0:8080"
Start-Process powershell -ArgumentList $StartArgs

Write-Host "      Starting frontend (port 5000)..." -ForegroundColor Cyan
Set-Location $FrontendDir
If (!(Test-Path "node_modules")) {
    Write-Host "      Installing frontend dependencies..." -ForegroundColor Gray
    npm install --silent
}
npm run dev

