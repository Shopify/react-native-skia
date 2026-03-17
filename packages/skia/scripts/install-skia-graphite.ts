/**
 * Install Skia Graphite prebuilt binaries
 *
 * This script downloads Graphite-enabled Skia binaries from GitHub releases,
 * verifies checksums, and sets up the Skia submodule to the matching version.
 */

// Set SK_GRAPHITE before importing skia-configuration so GRAPHITE flag is true
process.env.SK_GRAPHITE = "1";

import { execSync } from "child_process";
import { createHash } from "crypto";
import {
  createWriteStream,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from "fs";
import https from "https";
import path from "path";

import { extract } from "tar";

import { copyHeaders } from "./skia-configuration";
import { fileOps } from "./utils";

// Graphite configuration
const GRAPHITE_CONFIG = {
  version: "m142b",
  checksums: {
    "android-armeabi-v7a":
      "e0103cf59061e4727e371eea9267cdbca112ed9153b539427a5ebbd95852df45",
    "android-arm64-v8a":
      "058d4b7070719b7c2759dd0712f9fddb276a596011aa61c64ebfec6521d53f7b",
    "android-x86":
      "e49b2c150250b407fe777e3814cdc6c7b141e7d8f7a2d92ea2cc5b2a6d3c4438",
    "android-x86_64":
      "bcdc22be78cb4acf6d1eb9a77254c2008c7b1b418a219ac054b1e6bd2ae39c72",
    "apple-xcframeworks":
      "b76635b99772496cf4b122e1ba6d22fb5fb33cc0497283adba2f6b41529b4cd7",
  },
} as const;

const SCRIPT_DIR = __dirname;
const PACKAGE_ROOT = path.resolve(SCRIPT_DIR, "..");
const REPO_ROOT = path.resolve(PACKAGE_ROOT, "../..");
const SKIA_DIR = path.resolve(REPO_ROOT, "externals/skia");
const LIBS_DIR = path.resolve(PACKAGE_ROOT, "libs");

// Get the base Skia version (e.g., "m142b" -> "m142")
const getBaseVersion = (version: string): string => {
  const match = version.match(/^(m\d+)/);
  return match ? match[1] : version;
};

// Get the GitHub release tag
const getReleaseTag = (version: string): string => {
  const baseVersion = getBaseVersion(version);
  return `skia-graphite-${baseVersion}`;
};

// Get the download URL for an asset
const getDownloadUrl = (assetName: string): string => {
  const releaseTag = getReleaseTag(GRAPHITE_CONFIG.version);
  return `https://github.com/Shopify/react-native-skia/releases/download/${releaseTag}/${assetName}`;
};

// Calculate directory checksum (matches the format used for verification)
const calculateDirectoryChecksum = (dirPath: string): string => {
  const hash = createHash("sha256");
  const processDir = (dir: string, relativePath: string = "") => {
    const entries = readdirSync(dir).sort();
    for (const entry of entries) {
      const fullPath = path.join(dir, entry);
      const entryRelativePath = path.join(relativePath, entry);
      const stat = statSync(fullPath);
      if (stat.isDirectory()) {
        processDir(fullPath, entryRelativePath);
      } else {
        hash.update(entryRelativePath);
        hash.update(readFileSync(fullPath));
      }
    }
  };
  processDir(dirPath);
  return hash.digest("hex");
};

// Download a file with redirect support
const downloadFile = (url: string, destPath: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const file = createWriteStream(destPath);
    const request = (currentUrl: string, redirectCount = 0) => {
      if (redirectCount > 5) {
        reject(new Error("Too many redirects"));
        return;
      }

      https
        .get(currentUrl, (response) => {
          if (
            response.statusCode &&
            response.statusCode >= 300 &&
            response.statusCode < 400 &&
            response.headers.location
          ) {
            request(response.headers.location, redirectCount + 1);
            return;
          }

          if (response.statusCode !== 200) {
            reject(new Error(`HTTP ${response.statusCode}: ${currentUrl}`));
            return;
          }

          response.pipe(file);
          file.on("finish", () => {
            file.close();
            resolve();
          });
        })
        .on("error", (err) => {
          rmSync(destPath, { force: true });
          reject(err);
        });
    };
    request(url);
  });
};

// Extract a tar.gz file
const extractTarGz = async (
  tarPath: string,
  destDir: string
): Promise<void> => {
  mkdirSync(destDir, { recursive: true });
  await extract({
    file: tarPath,
    cwd: destDir,
  });
};

// Download and extract an asset
const downloadAndExtract = async (
  assetName: string,
  destDir: string,
  expectedChecksum?: string
): Promise<void> => {
  const url = getDownloadUrl(assetName);
  const tempFile = path.join(LIBS_DIR, `${assetName}.tmp`);

  console.log(`  Downloading ${assetName}...`);

  await downloadFile(url, tempFile);

  // Extract
  console.log(`  Extracting to ${destDir}...`);
  if (existsSync(destDir)) {
    rmSync(destDir, { recursive: true, force: true });
  }
  await extractTarGz(tempFile, destDir);

  // Cleanup temp file
  rmSync(tempFile, { force: true });

  // Verify checksum if provided
  if (expectedChecksum) {
    console.log(`  Verifying checksum...`);
    const actualChecksum = calculateDirectoryChecksum(destDir);
    if (actualChecksum !== expectedChecksum) {
      throw new Error(
        `Checksum mismatch for ${assetName}:\n` +
          `  Expected: ${expectedChecksum}\n` +
          `  Actual:   ${actualChecksum}`
      );
    }
    console.log(`  ✓ Checksum verified`);
  }
};

// Checkout the Skia submodule to the correct branch
const checkoutSkiaSubmodule = (): void => {
  const baseVersion = getBaseVersion(GRAPHITE_CONFIG.version);
  const branchName = `chrome/${baseVersion}`;

  console.log(`\n📦 Checking out Skia submodule to ${branchName}...`);

  try {
    // Fetch the branch (this puts it in FETCH_HEAD)
    execSync(`git -C "${SKIA_DIR}" fetch origin ${branchName}`, {
      stdio: "inherit",
    });

    // Checkout FETCH_HEAD (the fetched branch)
    execSync(`git -C "${SKIA_DIR}" checkout FETCH_HEAD --`, {
      stdio: "inherit",
    });

    console.log(`  ✓ Skia submodule checked out to ${branchName}`);
  } catch (error) {
    console.error(`  ✗ Failed to checkout Skia submodule`);
    throw error;
  }
};

// Copy Dawn/WebGPU headers into cpp/dawn/include
// Merges generated headers (from Android build output) with source headers (from Skia submodule)
const copyDawnHeaders = (): void => {
  console.log(`\n📋 Copying Dawn/WebGPU headers...`);

  const dawnDest = path.join(PACKAGE_ROOT, "cpp/dawn/include");
  fileOps.rm(path.join(PACKAGE_ROOT, "cpp/dawn"));
  fileOps.mkdir(dawnDest);

  // 1. Copy source headers from the Skia submodule's Dawn
  const dawnSrcDir = path.join(
    SKIA_DIR,
    "third_party/externals/dawn/include"
  );
  fileOps.cp(dawnSrcDir, dawnDest);

  // 2. Copy generated headers from Android build output (overrides/adds to source)
  const genDir = path.join(
    LIBS_DIR,
    "android/arm64-v8a/gen/third_party/externals/dawn/include"
  );
  fileOps.cp(genDir, dawnDest);

  // Move dawn/webgpu.h and dawn/webgpu_cpp.h to webgpu/
  const webgpuH = path.join(dawnDest, "dawn/webgpu.h");
  const webgpuCppH = path.join(dawnDest, "dawn/webgpu_cpp.h");
  if (existsSync(webgpuH)) {
    fileOps.cp(webgpuH, path.join(dawnDest, "webgpu/webgpu.h"));
    fileOps.rm(webgpuH);
  }
  if (existsSync(webgpuCppH)) {
    fileOps.cp(webgpuCppH, path.join(dawnDest, "webgpu/webgpu_cpp.h"));
    fileOps.rm(webgpuCppH);
  }

  // Fix WebGPU header references
  const dawnProcTable = path.join(dawnDest, "dawn/dawn_proc_table.h");
  if (existsSync(dawnProcTable)) {
    fileOps.sed(
      dawnProcTable,
      /#include "dawn\/webgpu\.h"/g,
      '#include "webgpu/webgpu.h"'
    );
  }

  // Cleanup unnecessary files
  fileOps.rm(path.join(dawnDest, "dawn/wire"));
  fileOps.rm(path.join(dawnDest, "dawn/BUILD.gn"));
  const webgpuPrintH = path.join(dawnDest, "webgpu/webgpu_cpp_print.h");
  if (existsSync(webgpuPrintH)) {
    fileOps.rm(webgpuPrintH);
  }
  const dawnPrintH = path.join(dawnDest, "dawn/webgpu_cpp_print.h");
  if (existsSync(dawnPrintH)) {
    fileOps.rm(dawnPrintH);
  }

  // Copy Graphite source headers from Skia submodule
  const graphiteDest = path.join(PACKAGE_ROOT, "cpp/skia/src/gpu/graphite");
  fileOps.mkdir(graphiteDest);
  const graphiteSrc = path.join(SKIA_DIR, "src/gpu/graphite");
  for (const header of [
    "ContextOptionsPriv.h",
    "ResourceTypes.h",
    "TextureProxyView.h",
  ]) {
    fileOps.cp(
      path.join(graphiteSrc, header),
      path.join(graphiteDest, header)
    );
  }

  console.log(`  ✓ Dawn/WebGPU and Graphite headers copied`);
};

// Download Android libraries
const downloadAndroidLibs = async (): Promise<void> => {
  console.log(`\n📱 Downloading Android Graphite libraries...`);

  const androidAbis = [
    { name: "armeabi-v7a", asset: "android-arm", nested: "arm" },
    { name: "arm64-v8a", asset: "android-arm-64", nested: "arm64" },
    { name: "x86", asset: "android-arm-x86", nested: "x86" },
    { name: "x86_64", asset: "android-arm-x64", nested: "x64" },
  ];

  const releaseTag = getReleaseTag(GRAPHITE_CONFIG.version);

  for (const abi of androidAbis) {
    const checksumKey =
      `android-${abi.name}` as keyof typeof GRAPHITE_CONFIG.checksums;
    const expectedChecksum = GRAPHITE_CONFIG.checksums[checksumKey];
    const assetName = `skia-graphite-${abi.asset}-${releaseTag}.tar.gz`;
    const destDir = path.join(LIBS_DIR, "android", abi.name);

    await downloadAndExtract(assetName, destDir, expectedChecksum);

    // Flatten: tarballs extract with a nested build dir (e.g. arm/, arm64/)
    // CMake expects libs directly in libs/android/{abi}/
    const nestedDir = path.join(destDir, abi.nested);
    if (existsSync(nestedDir)) {
      execSync(`mv "${nestedDir}"/* "${destDir}"/`);
      rmSync(nestedDir, { recursive: true, force: true });
    }
  }

  console.log(`  ✓ Android libraries downloaded`);
};

// Download Apple libraries
const downloadAppleLibs = async (): Promise<void> => {
  console.log(`\n🍎 Downloading Apple Graphite libraries...`);

  const releaseTag = getReleaseTag(GRAPHITE_CONFIG.version);
  const assetName = `skia-graphite-apple-xcframeworks-${releaseTag}.tar.gz`;
  const tempDir = path.join(LIBS_DIR, "apple-temp");

  await downloadAndExtract(
    assetName,
    tempDir,
    GRAPHITE_CONFIG.checksums["apple-xcframeworks"]
  );

  // Move xcframeworks from nested 'apple' directory to ios/macos directories
  const extractedAppleDir = path.join(tempDir, "apple");
  const iosDir = path.join(LIBS_DIR, "ios");
  const macosDir = path.join(LIBS_DIR, "macos");

  // Clean and create destination directories
  fileOps.rm(iosDir);
  fileOps.rm(macosDir);
  fileOps.mkdir(iosDir);
  fileOps.mkdir(macosDir);

  // Copy xcframeworks to both ios and macos (they're universal)
  if (existsSync(extractedAppleDir)) {
    const xcframeworks = readdirSync(extractedAppleDir).filter((f) =>
      f.endsWith(".xcframework")
    );
    for (const xcf of xcframeworks) {
      fileOps.cp(path.join(extractedAppleDir, xcf), path.join(iosDir, xcf));
      fileOps.cp(path.join(extractedAppleDir, xcf), path.join(macosDir, xcf));
    }
  }

  // Cleanup temp directory
  rmSync(tempDir, { recursive: true, force: true });

  console.log(`  ✓ Apple libraries downloaded`);
};

// Main installation function
const install = async (): Promise<void> => {
  console.log(`\n🚀 Installing Skia Graphite ${GRAPHITE_CONFIG.version}\n`);
  console.log(`   Release tag: ${getReleaseTag(GRAPHITE_CONFIG.version)}`);
  console.log(
    `   Skia branch: chrome/${getBaseVersion(GRAPHITE_CONFIG.version)}`
  );

  // Ensure libs directory exists
  mkdirSync(LIBS_DIR, { recursive: true });

  // Checkout Skia submodule to matching version
  checkoutSkiaSubmodule();

  // Copy Skia headers
  copyHeaders();

  // Download platform libraries
  await downloadAndroidLibs();
  await downloadAppleLibs();

  // Copy Dawn/WebGPU headers from Android build output
  copyDawnHeaders();

  // Write marker file so podspec and build.gradle can detect Graphite
  const markerFile = path.join(LIBS_DIR, ".graphite");
  writeFileSync(markerFile, GRAPHITE_CONFIG.version, "utf-8");
  console.log(`  ✓ Wrote Graphite marker file: ${markerFile}`);

  console.log(
    `\n✅ Skia Graphite ${GRAPHITE_CONFIG.version} installed successfully!\n`
  );
};

// Run installation
install().catch((error) => {
  console.error(`\n❌ Installation failed: ${error.message}\n`);
  process.exit(1);
});
