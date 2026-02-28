import fs from "fs";
import path from "path";
import { createRequire } from "module";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

// Allow skipping via environment variable (useful for CI builds or local Skia builds)
if (
  process.env.SKIP_SKIA_BINARIES === "1" ||
  process.env.SKIP_SKIA_BINARIES === "true"
) {
  console.log("⏭️  Skipping Skia binaries copy (SKIP_SKIA_BINARIES is set)");
  process.exit(0);
}

const GRAPHITE = !!process.env.SK_GRAPHITE;
const libsDir = path.resolve(__dirname, "../libs");

/**
 * Resolve the path to an npm package, handling monorepos and hoisting
 */
const resolvePackage = (packageName) => {
  try {
    const packageJsonPath = require.resolve(`${packageName}/package.json`);
    return path.dirname(packageJsonPath);
  } catch (e) {
    return null;
  }
};

/**
 * Copy directory recursively
 */
const copyDir = (src, dest) => {
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else if (entry.isFile()) {
      fs.copyFileSync(srcPath, destPath);
    }
  }
};

/**
 * Clear directory contents
 */
const clearDirectory = (directory) => {
  if (fs.existsSync(directory)) {
    fs.rmSync(directory, { recursive: true, force: true });
  }
  fs.mkdirSync(directory, { recursive: true });
};

const main = () => {
  console.log(
    `📦 Copying Skia prebuilt binaries (${GRAPHITE ? "Graphite" : "Ganesh"})...`
  );

  // Define packages based on build mode
  const prefix = GRAPHITE ? "react-native-skia-graphite" : "react-native-skia";
  const androidPackage = `${prefix}-android`;
  const iosPackage = `${prefix}-apple-ios`;
  const macosPackage = `${prefix}-apple-macos`;
  // tvOS is only available for non-Graphite builds
  const tvosPackage = GRAPHITE ? null : `${prefix}-apple-tvos`;
  const headersPackage = GRAPHITE ? `${prefix}-headers` : null;

  // Resolve package locations
  const androidPath = resolvePackage(androidPackage);
  const iosPath = resolvePackage(iosPackage);
  const macosPath = resolvePackage(macosPackage);
  const tvosPath = tvosPackage ? resolvePackage(tvosPackage) : null;
  const headersPath = headersPackage ? resolvePackage(headersPackage) : null;

  // Check required packages exist
  const missing = [];
  if (!androidPath) missing.push(androidPackage);
  if (!iosPath) missing.push(iosPackage);
  if (!macosPath) missing.push(macosPackage);
  if (tvosPackage && !tvosPath) missing.push(tvosPackage);
  if (headersPackage && !headersPath) missing.push(headersPackage);

  if (missing.length > 0) {
    console.error("❌ Missing required packages:");
    missing.forEach((pkg) => console.error(`   - ${pkg}`));
    console.error("\nPlease install the missing packages:");
    console.error(`   npm install ${missing.join(" ")}`);
    process.exit(1);
  }

  console.log(`   Android: ${androidPath}`);
  console.log(`   iOS: ${iosPath}`);
  console.log(`   macOS: ${macosPath}`);
  if (tvosPath) console.log(`   tvOS: ${tvosPath}`);
  if (headersPath) console.log(`   Headers: ${headersPath}`);

  // Clear and prepare libs directory
  clearDirectory(libsDir);

  // Copy Android binaries
  const androidSrc = path.join(androidPath, "libs");
  const androidDest = path.join(libsDir, "android");
  if (fs.existsSync(androidSrc)) {
    console.log("   Copying Android binaries...");
    copyDir(androidSrc, androidDest);
  }

  // Copy Apple binaries
  const appleDest = path.join(libsDir, "apple");
  fs.mkdirSync(appleDest, { recursive: true });

  // iOS
  const iosSrc = path.join(iosPath, "libs");
  const iosDestDir = path.join(appleDest, "ios");
  if (fs.existsSync(iosSrc)) {
    console.log("   Copying iOS binaries...");
    copyDir(iosSrc, iosDestDir);
  }

  // macOS
  const macosSrc = path.join(macosPath, "libs");
  const macosDestDir = path.join(appleDest, "macos");
  if (fs.existsSync(macosSrc)) {
    console.log("   Copying macOS binaries...");
    copyDir(macosSrc, macosDestDir);
  }

  // tvOS (non-Graphite only)
  if (tvosPath) {
    const tvosSrc = path.join(tvosPath, "libs");
    const tvosDestDir = path.join(appleDest, "tvos");
    if (fs.existsSync(tvosSrc)) {
      console.log("   Copying tvOS binaries...");
      copyDir(tvosSrc, tvosDestDir);
    }
  }

  // Create or remove Graphite marker files
  const androidMarker = path.join(androidDest, "graphite.enabled");
  const appleMarker = path.join(appleDest, "graphite.enabled");

  if (GRAPHITE) {
    fs.writeFileSync(androidMarker, "");
    fs.writeFileSync(appleMarker, "");
    console.log("   Created Graphite marker files");

    // Copy Graphite headers if available
    if (headersPath) {
      console.log("   Copying Graphite headers...");
      const cppDir = path.resolve(__dirname, "../cpp");

      // Copy dawn/include
      const dawnSrc = path.join(headersPath, "dawn", "include");
      const dawnDest = path.join(cppDir, "dawn", "include");
      if (fs.existsSync(dawnSrc)) {
        copyDir(dawnSrc, dawnDest);
        console.log("   ✓ Dawn headers copied");
      }

      // Copy graphite headers
      const graphiteSrc = path.join(headersPath, "skia", "src", "gpu", "graphite");
      const graphiteDest = path.join(cppDir, "skia", "src", "gpu", "graphite");
      if (fs.existsSync(graphiteSrc)) {
        copyDir(graphiteSrc, graphiteDest);
        console.log("   ✓ Graphite headers copied");
      }
    }
  }

  console.log("✅ Skia binaries copied successfully");
};

main();
