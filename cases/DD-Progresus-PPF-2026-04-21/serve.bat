@echo off
cd /d "%~dp0"
set PORT=%1
if "%PORT%"=="" set PORT=8000
echo Mycelium DD - Lokální server
echo Otevírám http://localhost:%PORT%/index.html
python -m http.server %PORT%
