#!/bin/bash

# dev.sh - Automated Daily Run for MediCare Hospital
# This script ensures uv is installed and then starts both servers.

echo -e "\033[0;36mChecking for uv...\033[0m"
if ! command -v uv &> /dev/null
then
    echo -e "\033[0;33muv not found, installing via pip...\033[0m"
    pip install uv
    
    # Try adding typical Windows Python user-scripts to PATH for current session
    export PATH="$PATH:$HOME/AppData/Local/Packages/PythonSoftwareFoundation.Python.3.13_qbz5n2kfra8p0/LocalCache/local-packages/Python313/Scripts"
fi

# Ensure uv is now available
if ! command -v uv &> /dev/null
then
    echo -e "\033[0;31mError: uv is not in your PATH. Please restart your terminal.\033[0m"
    exit 1
fi

echo -e "\033[0;36mSetting up backend...\033[0m"
cd artifacts/api-server
uv venv &> /dev/null
source .venv/Scripts/activate &> /dev/null || source .venv/bin/activate &> /dev/null
uv pip install -r requirements.txt
uv run python manage.py migrate
# Seed users (only first time, but safe to pipe)
cat seed_users.py | uv run python manage.py shell &> /dev/null

# Start Backend in background (or new window if possible, but standard bash is bg)
echo -e "\033[0;32mStarting Backend on port 8080...\033[0m"
uv run python manage.py runserver 0.0.0.0:8080 &

echo -e "\033[0;36mSetting up frontend...\033[0m"
cd ../../frontend
npm install

echo -e "\033[0;32mStarting Frontend on port 5000...\033[0m"
npm run dev
