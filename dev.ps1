# dev.ps1 — Start both backend and frontend for MediCare Hospital
# Uses uv with the workspace-level pyproject.toml (no separate venv needed).

$RepoRoot = Split-Path -Parent $MyInvocation.MyCommand.Definition

Write-Host "[1/4] Checking uv..." -ForegroundColor Cyan
if (!(Get-Command uv -ErrorAction SilentlyContinue)) {
    Write-Host "ERROR: uv not found. Run: pip install uv" -ForegroundColor Red
    exit 1
}
Write-Host "      uv $(uv --version) — OK" -ForegroundColor Green

Write-Host "[2/4] Running Django migrations..." -ForegroundColor Cyan
Set-Location "$RepoRoot\artifacts\api-server"
uv run python manage.py migrate --no-input

Write-Host "[3/4] Seeding initial users (safe to run multiple times)..." -ForegroundColor Cyan
Get-Content seed_users.py | uv run python manage.py shell 2>$null

Write-Host ""
Write-Host "  Backend  → http://localhost:8080" -ForegroundColor White
Write-Host "  Frontend → http://localhost:5000" -ForegroundColor White
Write-Host ""

Write-Host "[4/4] Starting backend in a new window (port 8080)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", `
    "Set-Location '$RepoRoot\artifacts\api-server'; uv run python manage.py runserver 0.0.0.0:8080"
Write-Host "      Backend window opened." -ForegroundColor Green

Write-Host "      Starting frontend (port 5000)..." -ForegroundColor Cyan
Set-Location "$RepoRoot\frontend"
npm install --silent
npm run dev
