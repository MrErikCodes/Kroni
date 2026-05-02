# Interactive Android screenshot helper. Walks you through the same
# 10-frame lineup as the iOS script, applies the SystemUI demo mode for
# a clean status bar, and saves each capture under
# screenshots/android/<lang>/NN-name.png.
#
# Run on Windows with the Android emulator booted (preferably Pixel 7
# Pro for 1440x3120). Requires `adb` on PATH (Android Studio's
# platform-tools).
#
# Usage:
#   .\scripts\capture-android.ps1            # defaults to nb
#   .\scripts\capture-android.ps1 en         # English locale run
#
# Prereqs:
#   - Android Studio + an AVD (Pixel 7 Pro recommended)
#   - Emulator running with the Kroni dev build installed (`npx expo run:android`)
#   - Device language switched in Emulator → Settings → System → Languages
#     to match the LANG arg before starting

param(
  [string]$Lang = 'nb'
)

$ErrorActionPreference = 'Stop'

$OutDir = "screenshots\android\$Lang"
New-Item -ItemType Directory -Force -Path $OutDir | Out-Null

# 1. Verify an emulator is connected.
$devices = & adb devices
if (-not ($devices -match 'emulator-\d+\s+device')) {
  Write-Host "❌ No Android emulator connected. Start one from Android Studio Device Manager," -ForegroundColor Red
  Write-Host "   then run: npx expo run:android"
  exit 1
}
Write-Host "✓ Emulator detected"
Write-Host "✓ Saving to: $OutDir\"
Write-Host ""

# 2. Clean status bar via SystemUI demo mode.
& adb shell settings put global sysui_demo_allowed 1 | Out-Null
& adb shell am broadcast -a com.android.systemui.demo -e command enter | Out-Null
& adb shell am broadcast -a com.android.systemui.demo -e command clock -e hhmm 0941 | Out-Null
& adb shell am broadcast -a com.android.systemui.demo -e command battery -e level 100 -e plugged false | Out-Null
& adb shell am broadcast -a com.android.systemui.demo -e command network -e wifi show -e level 4 | Out-Null
& adb shell am broadcast -a com.android.systemui.demo -e command network -e mobile show -e datatype none -e level 4 | Out-Null
& adb shell am broadcast -a com.android.systemui.demo -e command notifications -e visible false | Out-Null
Write-Host "✓ Status bar overridden (9:41, full bars, no notifs)"
Write-Host ""

# 3. Frame lineup. Edit here if the app changes.
$Frames = @(
  @{ Name = '01-approvals';     Desc = 'Approvals tab — pending approval cards visible';        Route = '(parent)/(tabs)/approvals' },
  @{ Name = '02-kids';          Desc = 'Kids tab — all 3 kids with avatars and balances';       Route = '(parent)/(tabs)/kids' },
  @{ Name = '03-task-new';      Desc = 'New task modal mid-fill (title + amount, recurring)';   Route = '(parent)/tasks/new' },
  @{ Name = '04-tasks';         Desc = 'Tasks list — recurring + one-off mix visible';          Route = '(parent)/(tabs)/tasks' },
  @{ Name = '05-rewards';       Desc = 'Rewards list — small + savings goals visible';          Route = '(parent)/(tabs)/rewards' },
  @{ Name = '06-settings';      Desc = 'Parent Settings — pause/holiday toggle in view';        Route = '(parent)/settings' },
  @{ Name = '07-kid-today';     Desc = 'Kid Today list — 1 task checked, 2 unchecked';          Route = '(kid)/(tabs)/today' },
  @{ Name = '08-kid-balance';   Desc = 'Kid Balance — number + goal progress bar';              Route = '(kid)/(tabs)/balance' },
  @{ Name = '09-kid-celebrate'; Desc = 'Kid Celebrate screen (confetti / approval moment)';     Route = '(kid)/celebrate' },
  @{ Name = '10-paywall';       Desc = 'Paywall — monthly/yearly/lifetime cards visible';       Route = '(parent)/paywall' }
)

Write-Host "Walking through 10 frames. After each prompt:"
Write-Host "  1. Navigate the emulator to the screen described."
Write-Host "  2. Make sure the layout matches the description (compose the shot)."
Write-Host "  3. Press Enter to capture. Capture overwrites if you re-run."
Write-Host "  Type 's' + Enter to skip a frame, 'q' + Enter to quit."
Write-Host ""

foreach ($frame in $Frames) {
  $OutFile = Join-Path $OutDir "$($frame.Name).png"
  Write-Host "─────────────────────────────────────────────────"
  Write-Host "Frame $($frame.Name)"
  Write-Host "  $($frame.Desc)"
  Write-Host "  Route: $($frame.Route)"
  Write-Host "  → $OutFile"
  $reply = Read-Host "Press Enter to capture (s = skip, q = quit)"
  switch ($reply.ToLower()) {
    'q' { Write-Host "Aborted."; exit 0 }
    's' { Write-Host "  ↪ skipped"; Write-Host ""; continue }
  }
  # PowerShell mangles binary stdout from `adb exec-out`, so route
  # through device storage: capture to /sdcard, pull, clean up.
  & adb shell screencap -p /sdcard/_kroni_capture.png | Out-Null
  & adb pull /sdcard/_kroni_capture.png $OutFile | Out-Null
  & adb shell rm /sdcard/_kroni_capture.png | Out-Null
  Write-Host "  ✓ saved"
  Write-Host ""
}

Write-Host "Done. Captured frames:"
Get-ChildItem $OutDir | Format-Table Name, Length

Write-Host ""
Write-Host "Reminder: switch device language in Settings → System → Languages"
Write-Host "before re-running this script for another locale."
