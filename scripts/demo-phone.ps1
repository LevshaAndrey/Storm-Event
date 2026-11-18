#Requires -Version 5.1
<#
    Starts the Storm Trip stack, connects a USB Android phone through adb
    and opens the PWA at http://localhost:<FRONTEND_PORT>.

    Usage:
        powershell -ExecutionPolicy Bypass -File scripts\demo-phone.ps1
        powershell -ExecutionPolicy Bypass -File scripts\demo-phone.ps1 -SkipBuild
#>
[CmdletBinding()]
param(
    [switch]$SkipBuild,
    [switch]$NoLaunch
)

$ErrorActionPreference = 'Stop'

$root = Resolve-Path (Join-Path $PSScriptRoot '..')
Set-Location $root

$port = if ($env:FRONTEND_PORT) { $env:FRONTEND_PORT } else { '3100' }
$url = "http://localhost:$port"

function Find-Adb {
    $command = Get-Command adb -ErrorAction SilentlyContinue
    if ($command) {
        return $command.Source
    }

    $candidates = @(
        (Join-Path $env:LOCALAPPDATA 'Android\Sdk\platform-tools\adb.exe'),
        (Join-Path $env:USERPROFILE 'AppData\Local\Android\Sdk\platform-tools\adb.exe'),
        'C:\Android\platform-tools\adb.exe',
        'C:\Program Files\Android\platform-tools\adb.exe'
    )

    foreach ($candidate in $candidates) {
        if (Test-Path $candidate) {
            return $candidate
        }
    }

    # winget installs Platform Tools into a versioned package folder.
    $wingetRoot = Join-Path $env:LOCALAPPDATA 'Microsoft\WinGet\Packages'
    if (Test-Path $wingetRoot) {
        $package = Get-ChildItem $wingetRoot -Directory -Filter 'Google.PlatformTools_*' -ErrorAction SilentlyContinue |
            Select-Object -First 1
        if ($package) {
            $candidate = Join-Path $package.FullName 'platform-tools\adb.exe'
            if (Test-Path $candidate) {
                return $candidate
            }
        }
    }

    return $null
}

function Test-PortFree {
    param([int]$Port)

    try {
        $listener = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction Stop
        return -not $listener
    } catch {
        # No listener found or the cmdlet is unavailable; let Docker report a real conflict.
        return $true
    }
}

function Get-LanIp {
    try {
        $route = Get-NetRoute -DestinationPrefix '0.0.0.0/0' -ErrorAction Stop |
            Where-Object { $_.NextHop -ne '0.0.0.0' } |
            Sort-Object RouteMetric, InterfaceMetric |
            Select-Object -First 1

        if ($route) {
            $address = Get-NetIPAddress -InterfaceIndex $route.InterfaceIndex -AddressFamily IPv4 -ErrorAction Stop |
                Where-Object { $_.IPAddress -notlike '169.254.*' } |
                Select-Object -First 1 -ExpandProperty IPAddress
            if ($address) {
                return $address
            }
        }
    } catch {
        # Fall through to the generic lookup.
    }

    try {
        return (Get-NetIPAddress -AddressFamily IPv4 -ErrorAction Stop |
            Where-Object {
                $_.IPAddress -ne '127.0.0.1' -and
                $_.IPAddress -notlike '169.254.*' -and
                $_.PrefixOrigin -ne 'WellKnown'
            } |
            Select-Object -First 1 -ExpandProperty IPAddress)
    } catch {
        return $null
    }
}

Write-Host ''
Write-Host '  Storm Trip - phone demo' -ForegroundColor Cyan
Write-Host '  ------------------------' -ForegroundColor DarkCyan
Write-Host ''

$backendPort = $env:BACKEND_PORT
if (-not $backendPort) {
    $existingPort = docker compose port backend 8080 2>$null
    if ($LASTEXITCODE -eq 0 -and $existingPort -match ':(\d+)\s*$') {
        $backendPort = $Matches[1]
    }
}

if (-not $backendPort) {
    $backendPort = '8080'
    if (-not (Test-PortFree 8080)) {
        $freePort = 8091..8105 | Where-Object { Test-PortFree $_ } | Select-Object -First 1
        if ($freePort) {
            $backendPort = [string]$freePort
            Write-Host "Port 8080 is busy; using $backendPort for the backend host port." -ForegroundColor DarkYellow
        }
    }
}
$env:BACKEND_PORT = $backendPort

if ($SkipBuild) {
    Write-Host 'Starting containers (no rebuild)...'
    docker compose up -d
} else {
    Write-Host 'Building and starting containers...'
    docker compose up -d --build
}

if ($LASTEXITCODE -ne 0) {
    throw 'docker compose failed. Is Docker Desktop running?'
}

Write-Host "Waiting for the frontend at $url ..."
$ready = $false
for ($attempt = 1; $attempt -le 60; $attempt++) {
    try {
        $response = Invoke-WebRequest -UseBasicParsing -Uri "$url/healthz" -TimeoutSec 2
        if ($response.StatusCode -eq 200) {
            $ready = $true
            break
        }
    } catch {
        # The container may still be starting.
    }
    Start-Sleep -Seconds 2
}

if (-not $ready) {
    Write-Host 'Frontend did not become healthy in time.' -ForegroundColor Red
    Write-Host 'Check the logs: docker compose logs frontend backend' -ForegroundColor Yellow
    exit 1
}

Write-Host "Frontend is up: $url" -ForegroundColor Green
Write-Host ''

$adb = Find-Adb

if (-not $adb) {
    Write-Host 'adb (Android Platform Tools) was not found.' -ForegroundColor Yellow
    Write-Host 'Install it and reopen the terminal:'
    Write-Host '    winget install --id Google.PlatformTools -e'
    Write-Host ''
    Write-Host 'Or use Wi-Fi instead of a cable:'
    $lanIp = Get-LanIp
    if ($lanIp) {
        Write-Host "    http://${lanIp}:$port" -ForegroundColor Cyan
        Write-Host 'Open this address on the phone connected to the same network.'
        Write-Host 'Allow the port in Windows Firewall if the page does not load.'
    } else {
        Write-Host "    Find the laptop IPv4 with ipconfig and open http://<IPv4>:$port"
    }
    exit 0
}

Write-Host "Using adb: $adb"
& $adb start-server | Out-Null

$deviceLines = & $adb devices |
    Select-Object -Skip 1 |
    Where-Object { $_ -match '\sdevice$' }

if (-not $deviceLines) {
    Write-Host 'No authorized Android device found.' -ForegroundColor Yellow
    Write-Host 'Checklist:'
    Write-Host '  1. Settings -> About phone -> tap Build number 7 times.'
    Write-Host '  2. Settings -> System -> Developer options -> enable USB debugging.'
    Write-Host '  3. Connect the cable and allow USB debugging on the phone.'
    Write-Host ''
    Write-Host 'Current adb devices:'
    & $adb devices
    exit 1
}

$model = (& $adb shell getprop ro.product.model).Trim()
Write-Host "Device connected: $model" -ForegroundColor Green

& $adb reverse "tcp:$port" "tcp:$port" | Out-Null
if ($LASTEXITCODE -ne 0) {
    throw "adb reverse failed. Reconnect the phone and retry."
}

if (-not $NoLaunch) {
    & $adb shell am start -a android.intent.action.VIEW -d $url | Out-Null
}

Write-Host ''
Write-Host "Phone is ready: $url" -ForegroundColor Green
Write-Host 'Chrome -> menu -> "Add to Home screen" to run it without the address bar.'
exit 0
