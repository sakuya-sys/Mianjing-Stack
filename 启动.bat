@echo off
chcp 65001 >nul
title Mianjing Ben
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo.
  echo [!] Node.js was not found.
  echo     Opening browser-only mode. Data will be saved in this browser.
  echo     Install Node.js to enable file storage.
  echo.
  start "" "%~dp0public\index.html"
  timeout /t 3 >nul
  exit /b 1
)

set OPEN_BROWSER=1
node server.js
echo.
echo Server stopped. Press any key to close.
pause >nul
