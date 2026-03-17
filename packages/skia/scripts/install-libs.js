#!/usr/bin/env node
"use strict";

const path = require("path");
const fs = require("fs");
const { execSync } = require("child_process");

// Skip copying when native builds are not needed (e.g. JS-only CI jobs)
if (process.env.SKIP_SKIA_DOWNLOAD === "1") {
  console.log("-- install-skia: SKIP_SKIA_DOWNLOAD=1, skipping");
  process.exit(0);
}

const useGraphite =
  process.env.SK_GRAPHITE === "1" ||
  (process.env.SK_GRAPHITE || "").toLowerCase() === "true";

const packageRoot = path.join(__dirname, "..");
const libsDir = path.join(packageRoot, "libs");
const configFile = path.join(libsDir, ".skia");

function resolvePackage(name) {
  try {
    return path.dirname(require.resolve(name + "/package.json"));
  } catch {
    return null;
  }
}

function installGraphiteDeps() {
  const pkg = JSON.parse(
    fs.readFileSync(path.join(packageRoot, "package.json"), "utf8")
  );
  const graphiteDeps = pkg.graphite;
  if (!graphiteDeps || Object.keys(graphiteDeps).length === 0) {
    console.error("ERROR: No graphite dependencies defined in package.json");
    process.exit(1);
  }

  // Check if already installed
  const allInstalled = Object.keys(graphiteDeps).every(
    (name) => resolvePackage(name) !== null
  );
  if (allInstalled) {
    return;
  }

  // Check if running inside another package manager's install (e.g. yarn install postinstall)
  // In that case, we can't install packages — the user needs to add them manually
  if (process.env.npm_lifecycle_event === "postinstall") {
    console.error(
      "ERROR: Graphite packages are not installed. Add them to your dependencies:\n" +
        Object.entries(graphiteDeps)
          .map(([name, version]) => "  " + name + "@" + version)
          .join("\n") +
        "\n\nOr run: npx install-skia"
    );
    process.exit(1);
  }

  // Build install args: "pkg@version pkg@version ..."
  const packages = Object.entries(graphiteDeps)
    .map(([name, version]) => name + "@" + version)
    .join(" ");

  console.log("-- Installing Graphite dependencies: " + packages);
  execSync("npm install --no-save " + packages, {
    cwd: packageRoot,
    stdio: "inherit",
  });
}

function copyAppleLibs() {
  const prefix = useGraphite
    ? "react-native-skia-graphite"
    : "react-native-skia";

  const iosPackage = resolvePackage(prefix + "-apple-ios");
  const macosPackage = resolvePackage(prefix + "-apple-macos");

  if (!iosPackage || !macosPackage) {
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
  for (const dir of ["ios", "macos", "tvos"]) {
    const target = path.join(libsDir, dir);
    if (fs.existsSync(target)) {
      fs.rmSync(target, { recursive: true });
    }
  }
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
    const tvosPackage = resolvePackage(prefix + "-apple-tvos");
    if (tvosPackage) {
      console.log("-- Skia tvOS package: " + tvosPackage);
      fs.mkdirSync(path.join(libsDir, "tvos"), { recursive: true });
      execSync(
        'cp -R "' +
          tvosPackage +
          '/libs/"*.xcframework "' +
          path.join(libsDir, "tvos") +
          '/"'
      );
    } else {
      console.log("-- tvOS package not found, skipping");
    }
  }

  console.log("-- Copied Apple xcframeworks to libs/");
}

function copyAndroidLibs() {
  const androidPackageName = useGraphite
    ? "react-native-skia-graphite-android"
    : "react-native-skia-android";

  const androidPackage = resolvePackage(androidPackageName);
  if (!androidPackage) {
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
  if (fs.existsSync(androidDest)) {
    fs.rmSync(androidDest, { recursive: true });
  }
  execSync('cp -R "' + androidSrcLibs + '" "' + androidDest + '"');

  console.log("-- Copied Android libs to libs/android/");
}

function checkoutSkiaSubmodule() {
  // Extract the major version from graphite deps to determine the Skia branch
  // e.g., "142.2.0" -> "chrome/m142"
  const pkg = JSON.parse(
    fs.readFileSync(path.join(packageRoot, "package.json"), "utf8")
  );
  const graphiteDeps = pkg.graphite;
  // Use the first graphite dep version to determine the branch
  const version = Object.values(graphiteDeps)[0];
  const major = String(version).split(".")[0];
  const branch = "chrome/m" + major;

  const skiaDir = path.join(packageRoot, "../../externals/skia");
  if (!fs.existsSync(skiaDir)) {
    console.log("-- Skia submodule not found at " + skiaDir + ", skipping checkout");
    return;
  }

  console.log("-- Checking out Skia submodule to " + branch);
  try {
    execSync('git -C "' + skiaDir + '" fetch origin ' + branch, {
      stdio: "inherit",
    });
    execSync('git -C "' + skiaDir + '" checkout FETCH_HEAD --', {
      stdio: "inherit",
    });
    console.log("-- Skia submodule checked out to " + branch);
  } catch (e) {
    console.error("WARNING: Failed to checkout Skia submodule to " + branch);
    console.error("  Headers may not match the Graphite binaries.");
  }
}

function writeConfig() {
  fs.mkdirSync(libsDir, { recursive: true });
  const config = {
    backend: useGraphite ? "graphite" : "ganesh",
  };
  fs.writeFileSync(configFile, JSON.stringify(config, null, 2) + "\n");
  console.log("-- Wrote " + configFile + " (backend: " + config.backend + ")");
}

// Main
console.log(
  "-- install-skia: " + (useGraphite ? "Graphite" : "standard") + " build"
);

if (useGraphite) {
  installGraphiteDeps();
  checkoutSkiaSubmodule();
}

writeConfig();
copyAppleLibs();
copyAndroidLibs();
