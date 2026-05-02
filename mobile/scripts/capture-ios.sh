#!/usr/bin/env bash
# Interactive iPhone screenshot helper. Walks you through the 10-frame
# lineup from docs/appstore.md, sets a clean status bar, and saves each
# capture under screenshots/ios/<lang>/NN-name.png.
#
# Run on the Mac, with the Simulator already booted (preferably iPhone
# 16 Pro Max for native 1320x2868 — App Store Connect auto-scales down
# for older device sizes).
#
# Usage:
#   ./scripts/capture-ios.sh         # defaults to nb
#   ./scripts/capture-ios.sh en      # English locale run
#
# Prereqs:
#   - Xcode + Simulator installed
#   - Simulator booted with the Kroni dev build running (`npx expo run:ios`)
#   - Device language switched in Simulator → Settings → General → Language
#     to match the LOCALE arg before starting

set -euo pipefail

LOCALE="${1:-nb}"
OUT_DIR="screenshots/ios/${LOCALE}"
mkdir -p "${OUT_DIR}"
# xcrun simctl resolves output paths against the simulator's cwd, not the
# calling shell's. Convert to absolute so the screenshot lands where we want.
OUT_DIR="$(cd "${OUT_DIR}" && pwd)"

# 1. Verify a simulator is booted.
if ! xcrun simctl list devices booted | grep -q "Booted"; then
  echo "❌ No iOS Simulator booted. Start one with:"
  echo "   npx expo run:ios --device \"iPhone 16 Pro Max\""
  exit 1
fi

DEVICE_NAME=$(xcrun simctl list devices booted | grep -E "Booted" | head -1 | sed -E 's/^[[:space:]]+([^(]+).*/\1/' | xargs)
echo "✓ Booted simulator: ${DEVICE_NAME}"
echo "✓ Saving to: ${OUT_DIR}/"
echo ""

# 2. Clean status bar — 9:41, full battery, no carrier, no notifs.
xcrun simctl status_bar booted override \
  --time "9:41" \
  --batteryState charged \
  --batteryLevel 100 \
  --cellularBars 4 \
  --wifiBars 3 \
  --dataNetwork wifi
echo "✓ Status bar overridden (9:41, full bars)"
echo ""

# 3. Frame lineup. Edit captions / routes here if the app changes.
FRAMES=(
  "01-approvals|Approvals tab — pending approval cards visible|(parent)/(tabs)/approvals"
  "02-kids|Kids tab — all 3 kids with avatars and balances|(parent)/(tabs)/kids"
  "03-task-new|New task modal mid-fill (title + amount, recurring picked)|(parent)/tasks/new"
  "04-tasks|Tasks list — recurring + one-off mix visible|(parent)/(tabs)/tasks"
  "05-rewards|Rewards list — small + savings goals visible|(parent)/(tabs)/rewards"
  "06-settings|Parent Settings — pause/holiday toggle in view|(parent)/settings"
  "07-kid-today|Kid Today list — 1 task checked, 2 unchecked|(kid)/(tabs)/today"
  "08-kid-balance|Kid Balance — number + goal progress bar|(kid)/(tabs)/balance"
  "09-kid-celebrate|Kid Celebrate screen (confetti / approval moment)|(kid)/celebrate"
  "10-paywall|Paywall — monthly/yearly/lifetime cards visible|(parent)/paywall"
)

echo "Walking through 10 frames. After each prompt:"
echo "  1. Navigate the Simulator to the screen described."
echo "  2. Make sure the layout matches the description (compose the shot)."
echo "  3. Press Enter to capture. Capture overwrites if you re-run."
echo "  Type 's' + Enter to skip a frame, 'q' + Enter to quit."
echo ""

for entry in "${FRAMES[@]}"; do
  IFS='|' read -r NAME DESC ROUTE <<< "${entry}"
  OUT_FILE="${OUT_DIR}/${NAME}.png"
  echo "─────────────────────────────────────────────────"
  echo "Frame ${NAME}"
  echo "  ${DESC}"
  echo "  Route: ${ROUTE}"
  echo "  → ${OUT_FILE}"
  printf "Press Enter to capture (s = skip, q = quit): "
  read -r REPLY
  case "${REPLY}" in
    q|Q) echo "Aborted."; exit 0 ;;
    s|S) echo "  ↪ skipped"; echo ""; continue ;;
  esac
  xcrun simctl io booted screenshot "${OUT_FILE}"
  echo "  ✓ saved"
  echo ""
done

echo "Done. Captured frames:"
ls -1 "${OUT_DIR}/"
echo ""
echo "Reminder: switch device language in Settings → General → Language"
echo "before re-running this script for another locale."
