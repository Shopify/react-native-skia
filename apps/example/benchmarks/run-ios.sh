#!/bin/bash
# Installs a .app on the iPhone 14 Pro, launches it on the Benchmarks list
# and queues the benchmarks. Usage: run-ios.sh <app bundle> [routes...]
set -euo pipefail
APP="$1"; shift
ROUTES=("$@")
if [ ${#ROUTES[@]} -eq 0 ]; then
  ROUTES=(HeavyCanvas ManyCanvases AndroidBacking SmallIcon GcStorm IconGrid)
fi
UDID=2BC2DC1B-1701-5AC5-A43B-9BA964FDF2E7
ID=com.microsoft.ReactTestAppSkia42
xcrun devicectl device install app --device $UDID "$APP" 2>&1 | tail -2
xcrun devicectl device process launch --terminate-existing --payload-url "rnskia://benchmarks" --device $UDID $ID 2>&1 | tail -2
PLAN=$(printf '"%s",' "${ROUTES[@]}")
python3 -c "import time; time.sleep(6)"
curl -s -X POST localhost:4299/plan?platform=ios -H 'content-type: application/json' -d "[${PLAN%,}]"
echo
echo "queued ${ROUTES[*]}"
