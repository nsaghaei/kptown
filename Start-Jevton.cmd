@echo off
set "JEVTON_PYTHON=%~dp0..\..\work\runtime\Scripts\python.exe"
if not exist "%JEVTON_PYTHON%" (
  echo The local Python environment is missing. See README.md for setup.
  pause
  exit /b 1
)
echo Jevton runs locally at http://127.0.0.1:8765
echo Keep this window open. Press Ctrl+C to stop the server.
"%JEVTON_PYTHON%" -u "%~dp0server.py"
pause
