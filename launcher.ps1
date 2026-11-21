# Rotorbound launcher: asks before updating from GitHub, keeps an offline copy of the 3D engine, opens the game in its own window.
$Here = Split-Path -Parent $MyInvocation.MyCommand.Path
$Repo = 'kefirman9000/rotorbound'
Set-Location $Here
try { [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12 } catch { }
Add-Type -AssemblyName System.Windows.Forms

function Get-LocalVersion {
  try { (Get-Content (Join-Path $Here 'version.json') -Raw | ConvertFrom-Json).version } catch { '0.0.0' }
}

# --- Update check (only installs if you click Yes) ---
try {
  $stamp = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
  $remote = Invoke-RestMethod -Uri "https://raw.githubusercontent.com/$Repo/main/version.json?t=$stamp" -TimeoutSec 6 -UseBasicParsing
  $local = Get-LocalVersion
  if ([version]$remote.version -gt [version]$local) {
    $msg = "Rotorbound v$($remote.version) is available (you have v$local).`n`n$($remote.notes)`n`nUpdate now?"
    $ans = [System.Windows.Forms.MessageBox]::Show($msg, 'Rotorbound update', 'YesNo', 'Question')
    if ($ans -eq 'Yes') {
      $zip = Join-Path $env:TEMP 'rotorbound-update.zip'
      $tmp = Join-Path $env:TEMP 'rotorbound-update'
      Invoke-WebRequest "https://github.com/$Repo/archive/refs/heads/main.zip" -OutFile $zip -UseBasicParsing
      if (Test-Path $tmp) { Remove-Item $tmp -Recurse -Force }
      Expand-Archive $zip -DestinationPath $tmp -Force
      $src = Get-ChildItem $tmp -Directory | Select-Object -First 1
      Copy-Item (Join-Path $src.FullName '*') $Here -Recurse -Force
      Remove-Item $zip, $tmp -Recurse -Force -ErrorAction SilentlyContinue
      [System.Windows.Forms.MessageBox]::Show("Updated to v$($remote.version).", 'Rotorbound update') | Out-Null
    }
  }
} catch { }

# --- Offline copy of the 3D engine (downloaded once) ---
$lib = Join-Path $Here 'lib'
$three = Join-Path $lib 'three.min.js'
if (-not (Test-Path $three)) {
  try {
    New-Item -ItemType Directory -Force $lib | Out-Null
    Invoke-WebRequest 'https://cdn.jsdelivr.net/npm/three@0.149.0/build/three.min.js' -OutFile $three -UseBasicParsing
  } catch { Remove-Item $three -ErrorAction SilentlyContinue }
}

# --- Launch in its own Edge app window (falls back to your default browser) ---
$url = ([Uri](Join-Path $Here 'index.html')).AbsoluteUri
$edge = @("${env:ProgramFiles(x86)}\Microsoft\Edge\Application\msedge.exe", "$env:ProgramFiles\Microsoft\Edge\Application\msedge.exe") |
  Where-Object { Test-Path $_ } | Select-Object -First 1
$prof = Join-Path $env:LOCALAPPDATA 'Rotorbound\browser'
if ($edge) {
  Start-Process $edge -ArgumentList "--app=`"$url`"", "--user-data-dir=`"$prof`"", '--no-first-run', '--no-default-browser-check', '--start-maximized', '--autoplay-policy=no-user-gesture-required'
} else {
  Start-Process $url
}
