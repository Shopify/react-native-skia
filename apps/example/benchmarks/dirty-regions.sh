#!/bin/bash
# Runs the small icon benchmark with HWUI's dirty-region overlay on and
# screenshots the spinner phase. Usage: dirty-regions.sh <tag>
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
TAG="$1"
PKG=com.microsoft.reacttestapp
touch "$HERE/results/.dirty-marker"
adb shell setprop debug.hwui.show_dirty_regions true
adb shell am force-stop $PKG
adb shell monkey -p $PKG 1 > /dev/null 2>&1
adb shell "sleep 5"
python3 "$HERE/uitap.py" "Benchmarks" --scroll-down 6
adb shell "sleep 2"
BEFORE=$(grep -c "capture start small-icon-spinner-$TAG-android" "$HERE/results-server.log" || true)
curl -s -X POST "localhost:4299/plan?platform=android" -H 'content-type: application/json' -d '["SmallIcon"]' > /dev/null
for i in $(seq 1 40); do
  NOW=$(grep -c "capture start small-icon-spinner-$TAG-android" "$HERE/results-server.log" || true)
  if [ "$NOW" -gt "$BEFORE" ]; then break; fi
  adb shell "sleep 1"
done
echo "spinner phase started after $i s"
adb shell "sleep 2"
for i in 1 2 3; do
  adb exec-out screencap -p > "$HERE/results/dirty-$TAG-$i.png"
  adb shell "sleep 1"
done
adb shell "sleep 12"
adb shell setprop debug.hwui.show_dirty_regions false
mkdir -p "$HERE/results/dirty-runs"
find "$HERE/results" -maxdepth 1 -name "*small-icon*$TAG-android*.json" -newer "$HERE/results/.dirty-marker" -exec mv {} "$HERE/results/dirty-runs/" \;
ls -la "$HERE"/results/dirty-$TAG-*.png | awk '{print $5, $9}'
