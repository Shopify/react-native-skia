#!/bin/bash
# Installs an APK on the Pixel 8, opens the Benchmarks list and queues the
# benchmarks on the results server. Usage: run-android.sh <apk> [routes...]
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
APK="$1"; shift
ROUTES=("$@")
if [ ${#ROUTES[@]} -eq 0 ]; then
  ROUTES=(HeavyCanvas ManyCanvases AndroidBacking SmallIcon GcStorm IconGrid)
fi
PKG=${ANDROID_PACKAGE:-com.reactnativeskia.example}
adb reverse tcp:4299 tcp:4299
adb shell svc power stayon usb
adb shell settings put system min_refresh_rate 120
adb shell settings put system peak_refresh_rate 120
adb install -r -d "$APK" | tail -1
adb shell am force-stop $PKG
adb shell monkey -p $PKG 1 > /dev/null 2>&1
adb shell "sleep 5"
python3 "$HERE/uitap.py" "Benchmarks" --scroll-down 6
adb shell "sleep 3"
python3 "$HERE/uitap.py" --dump | grep -i -E "benchmark|remote" | head -3
PLAN=$(printf '"%s",' "${ROUTES[@]}")
curl -s -X POST localhost:4299/plan?platform=android -H 'content-type: application/json' -d "[${PLAN%,}]"
echo
echo "queued ${ROUTES[*]}"
