#!/usr/bin/env node
"use strict";

const path = require("path");
const fs = require("fs");
const { execSync } = require("child_process");

const useGraphite =
  process.env.SK_GRAPHITE === "1" ||
  (process.env.SK_GRAPHITE || "").toLowerCase() === "true";
const prefix = useGraphite ? "react-native-skia-graphite" : "react-native-skia";
const libsDir = path.join(__dirname, "..", "libs");

// --- Apple platforms ---

let iosPackage, macosPackage;
try {
  iosPackage = path.dirname(
    require.resolve(prefix + "-apple-ios/package.json")
  );
  macosPackage = path.dirname(
    require.resolve(prefix + "-apple-macos/package.json")
  );
} catch (e) {
  console.error(
    "ERROR: Could not find " +
      prefix +
      "-apple-ios or " +
      prefix +
      "-apple-macos"
  );
  console.error("Make sure you have run yarn install or npm install");
  process.exit(1);
}

// Verify xcframeworks exist in the iOS package
const iosXcf = path.join(iosPackage, "libs");
if (
  !fs.existsSync(iosXcf) ||
  !fs.readdirSync(iosXcf).some((f) => f.endsWith(".xcframework"))
) {
  console.error(
    "ERROR: Skia prebuilt binaries not found in " + prefix + "-apple-ios!"
  );
  process.exit(1);
}

console.log("-- Skia iOS package: " + iosPackage);
console.log("-- Skia macOS package: " + macosPackage);

// Clean and copy Apple frameworks
execSync(
  "rm -rf " +
    path.join(libsDir, "ios") +
    " " +
    path.join(libsDir, "macos") +
    " " +
    path.join(libsDir, "tvos")
);
fs.mkdirSync(path.join(libsDir, "ios"), { recursive: true });
fs.mkdirSync(path.join(libsDir, "macos"), { recursive: true });
execSync(
  'cp -R "' +
    iosPackage +
    '/libs/"*.xcframework "' +
    path.join(libsDir, "ios") +
    '/"'
);
execSync(
  'cp -R "' +
    macosPackage +
    '/libs/"*.xcframework "' +
    path.join(libsDir, "macos") +
    '/"'
);

// Handle tvOS (non-Graphite only)
if (!useGraphite) {
  try {
    const tvosPackage = path.dirname(
      require.resolve(prefix + "-apple-tvos/package.json")
    );
    console.log("-- Skia tvOS package: " + tvosPackage);
    fs.mkdirSync(path.join(libsDir, "tvos"), { recursive: true });
    execSync(
      'cp -R "' +
        tvosPackage +
        '/libs/"*.xcframework "' +
        path.join(libsDir, "tvos") +
        '/"'
    );
  } catch (e) {
    console.log("-- tvOS package not found, skipping");
  }
}

console.log("-- Copied Apple xcframeworks to libs/");

// --- Android ---

const androidPackageName = useGraphite
  ? "react-native-skia-graphite-android"
  : "react-native-skia-android";

let androidPackage;
try {
  androidPackage = path.dirname(
    require.resolve(androidPackageName + "/package.json")
  );
} catch (e) {
  console.error("ERROR: Could not find " + androidPackageName);
  console.error("Make sure you have run yarn install or npm install");
  process.exit(1);
}

const androidSrcLibs = path.join(androidPackage, "libs");
if (!fs.existsSync(androidSrcLibs)) {
  console.error(
    "ERROR: Skia prebuilt binaries not found in " + androidPackageName + "!"
  );
  process.exit(1);
}

console.log("-- Skia Android package: " + androidPackage);

// Copy Android libs (per-ABI static libraries)
const androidDest = path.join(libsDir, "android");
execSync("rm -rf " + androidDest);
execSync('cp -R "' + androidSrcLibs + '" "' + androidDest + '"');

console.log("-- Copied Android libs to libs/android/");
