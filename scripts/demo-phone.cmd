@echo off
setlocal
rem Double-click launcher for the USB phone demo.
rem Pass -SkipBuild to reuse the current images.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0demo-phone.ps1" %*
echo.
pause
