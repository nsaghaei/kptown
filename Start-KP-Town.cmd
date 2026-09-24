@echo off
set "KP_TOWN_PYTHON=%~dp0.venv\Scripts\python.exe"
set "KP_TOWN_MODEL=%~dp0models\laya"
if not exist "%KP_TOWN_PYTHON%" (
  set "KP_TOWN_PYTHON=%~dp0..\..\work\runtime\Scripts\python.exe"
  set "KP_TOWN_MODEL=%~dp0..\..\work\models\laya"
)
if not exist "%KP_TOWN_PYTHON%" (
  echo The Python environment is missing. See README.md for setup.
  pause
  exit /b 1
)
echo KP Town runs locally at http://127.0.0.1:8765
echo Keep this window open. Press Ctrl+C to stop the server.
"%KP_TOWN_PYTHON%" -u "%~dp0server.py" --model "%KP_TOWN_MODEL%" --device cuda
pause
