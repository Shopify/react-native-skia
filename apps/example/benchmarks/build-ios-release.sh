#!/bin/bash
# Bundles the example app's JS (release, Hermes bytecode), runs pod install
# so the test app packages it, restores the signing settings pod install
# drops, allows 120 Hz on the iPhone, and builds Release for the device.
# Usage: build-ios-release.sh [checkout]   (SKIP_POD=1 skips pod install)
set -euo pipefail
CHECKOUT="${1:-$(cd "$(dirname "$0")/../../.." && pwd)}"
UDID="2BC2DC1B-1701-5AC5-A43B-9BA964FDF2E7"
cd "$CHECKOUT/apps/example"
HERMESC="$CHECKOUT/apps/example/ios/Pods/hermes-engine/destroot/bin/hermesc"
test -x "$HERMESC" || { echo "no hermesc at $HERMESC"; exit 1; }
mkdir -p dist
echo "== bundle ios =="
yarn react-native bundle --entry-file index.js --platform ios --dev false --minify true \
  --bundle-output dist/main.ios.jsbundle --assets-dest dist --reset-cache
echo "== hermesc =="
"$HERMESC" -O -w -emit-binary -out dist/main.ios.jsbundle.hbc dist/main.ios.jsbundle
mv dist/main.ios.jsbundle.hbc dist/main.ios.jsbundle
ls -la dist/main.ios.jsbundle
if [ -z "${SKIP_POD:-}" ]; then
echo "== pod install =="
pod install --project-directory=ios
echo "== signing + ProMotion =="
python3 - <<'EOF'
import pathlib
p = pathlib.Path("node_modules/.generated/ios/ReactTestApp.xcodeproj/project.pbxproj")
s = p.read_text()
old = "PRODUCT_BUNDLE_IDENTIFIER = com.microsoft.ReactTestApp;"
new = "PRODUCT_BUNDLE_IDENTIFIER = com.microsoft.ReactTestAppSkia42;\n\t\t\t\tDEVELOPMENT_TEAM = X29422Z79J;"
n = s.count(old)
s = s.replace(old, new)
p.write_text(s)
print(f"patched {n} bundle id lines; Skia42 lines now {s.count('ReactTestAppSkia42')}")
EOF
PLIST=node_modules/.generated/ios/Info.plist
/usr/libexec/PlistBuddy -c "Add :CADisableMinimumFrameDurationOnPhone bool true" "$PLIST" 2>/dev/null \
  || /usr/libexec/PlistBuddy -c "Set :CADisableMinimumFrameDurationOnPhone true" "$PLIST"
/usr/libexec/PlistBuddy -c "Print :CADisableMinimumFrameDurationOnPhone" "$PLIST"
fi
echo "== xcodebuild Release =="
xcodebuild -workspace ios/example.xcworkspace -scheme example -configuration Release -sdk iphoneos \
  -destination "platform=iOS,id=$UDID" -allowProvisioningUpdates build > "$CHECKOUT/apps/example/xcodebuild-release.log" 2>&1 \
  || { echo "xcodebuild failed"; grep -E "error:|\*\* BUILD" "$CHECKOUT/apps/example/xcodebuild-release.log" | tail -20; exit 1; }
grep -E "\*\* BUILD|Release-iphoneos/ReactTestApp.app" "$CHECKOUT/apps/example/xcodebuild-release.log" | tail -3
echo "== done =="
