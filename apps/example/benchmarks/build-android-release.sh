#!/bin/bash
# Bundles the example app's JS (release, Hermes bytecode) and builds the
# release APK for arm64. Usage: android-release.sh <checkout>
set -euo pipefail
CHECKOUT="${1:-$(cd "$(dirname "$0")/../../.." && pwd)}"
cd "$CHECKOUT/apps/example"
HERMESC="$CHECKOUT/apps/example/ios/Pods/hermes-engine/destroot/bin/hermesc"
test -x "$HERMESC" || { echo "no hermesc at $HERMESC"; exit 1; }
mkdir -p dist
echo "== bundle android =="
yarn react-native bundle --entry-file index.js --platform android --dev false --minify true \
  --bundle-output dist/main.android.jsbundle --assets-dest dist/res --reset-cache
echo "== hermesc =="
"$HERMESC" -O -w -emit-binary -out dist/main.android.jsbundle.hbc dist/main.android.jsbundle
mv dist/main.android.jsbundle.hbc dist/main.android.jsbundle
ls -la dist/main.android.jsbundle
echo "== gradle assembleRelease =="
cd android
./gradlew :app:assembleRelease -PreactNativeArchitectures=arm64-v8a
ls -la app/build/outputs/apk/release/
echo "== done =="
