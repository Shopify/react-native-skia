import fs from "fs";
import path from "path";

import { $ } from "./utils";
import { GRAPHITE, SkiaSrc } from "./skia-configuration";

const repo = "shopify/react-native-skia";
const prefix = GRAPHITE ? "skia-graphite" : "skia";
const names = [
  `${prefix}-android-arm`,
  `${prefix}-android-arm-64`,
  `${prefix}-android-arm-x64`,
  `${prefix}-android-arm-x86`,
  `${prefix}-apple-xcframeworks`,
];
if (GRAPHITE) {
  names.push("skia-graphite-headers");
}

// Get Skia version from the git branch
const getSkiaVersion = (): string => {
  try {
    let branch = $(
      `git -C "${SkiaSrc}" branch --show-current`
    ).toString("utf8").trim();

    if (!branch) {
      branch = $(
        `git -C "${SkiaSrc}" describe --all --exact-match 2>/dev/null`
      ).toString("utf8").trim();
    }

    if (!branch) {
      throw new Error("Could not determine Skia branch");
    }

    // Strip remotes/origin/chrome/ or chrome/ prefix if present
    branch = branch.replace(/^remotes\/origin\/chrome\//, "");
    branch = branch.replace(/^chrome\//, "");

    return branch;
  } catch (error) {
    throw new Error(`Failed to get Skia version: ${error}`);
  }
};

const skiaVersion = getSkiaVersion();
const releaseTag = `skia-${skiaVersion}`;
console.log(`📦 Downloading Skia prebuilt binaries for version: ${skiaVersion}`);

const artifactsDir = path.resolve(
  __dirname,
  "../../../packages/skia/artifacts"
);

const libsDir = path.resolve(__dirname, "../libs");

// Function to clear directory contents
const clearDirectory = (directory: string) => {
  if (fs.existsSync(directory)) {
    fs.readdirSync(directory).forEach((file) => {
      const curPath = path.join(directory, file);
      if (fs.lstatSync(curPath).isDirectory()) {
        clearDirectory(curPath);
        fs.rmdirSync(curPath);
      } else {
        fs.unlinkSync(curPath);
      }
    });
    //console.log(`❌ ${directory}`);
  } else {
    console.log(`Directory ${directory} does not exist, creating it...`);
    fs.mkdirSync(directory, { recursive: true });
  }
};

console.log("🧹 Clearing existing artifacts...");
clearDirectory(artifactsDir);

console.log(`⬇️  Downloading release assets to ${artifactsDir}`);
names.forEach((artifactName) => {
  const assetName = `${artifactName}-${releaseTag}.tar.gz`;
  const assetPath = path.join(artifactsDir, assetName);
  const extractDir = path.join(artifactsDir, artifactName);

  console.log(`   Downloading ${assetName}...`);
  $(
    `gh release download "${releaseTag}" --repo "${repo}" --pattern "${assetName}" --dir "${artifactsDir}"`
  );

  console.log(`   Extracting ${assetName}...`);
  fs.mkdirSync(extractDir, { recursive: true });
  $(
    `tar -xzf "${assetPath}" -C "${extractDir}" --strip-components=0`
  );

  // Clean up the tar file
  fs.unlinkSync(assetPath);
});

// Copy artifacts to libs folder in the required structure
console.log("📦 Copying artifacts to libs folder...");
clearDirectory(libsDir);

// Create android directory structure
const androidDir = path.join(libsDir, "android");
fs.mkdirSync(androidDir, { recursive: true });

// Copy android artifacts
const androidArchs = [
  { src: "skia-android-arm", dest: "armeabi-v7a" },
  { src: "skia-android-arm-64", dest: "arm64-v8a" },
  { src: "skia-android-arm-x86", dest: "x86" },
  { src: "skia-android-arm-x64", dest: "x86_64" },
];

androidArchs.forEach(({ src, dest }) => {
  // The tar file extracts to artifactName/dest (e.g., skia-android-arm/armeabi-v7a)
  const srcDir = path.join(artifactsDir, src, dest);
  const destDir = path.join(androidDir, dest);
  if (fs.existsSync(srcDir)) {
    fs.mkdirSync(destDir, { recursive: true });
    fs.readdirSync(srcDir).forEach((file) => {
      fs.copyFileSync(path.join(srcDir, file), path.join(destDir, file));
    });
  }
});

// Create apple directory structure
const appleDir = path.join(libsDir, "apple");
// The tar file extracts to skia-apple-xcframeworks/apple
const appleSrcDir = path.join(artifactsDir, "skia-apple-xcframeworks", "apple");
if (fs.existsSync(appleSrcDir)) {
  fs.mkdirSync(appleDir, { recursive: true });

  // Copy all xcframeworks
  fs.readdirSync(appleSrcDir).forEach((item) => {
    const srcPath = path.join(appleSrcDir, item);
    const destPath = path.join(appleDir, item);

    if (fs.lstatSync(srcPath).isDirectory()) {
      // Copy directory recursively
      const copyDir = (src: string, dest: string) => {
        fs.mkdirSync(dest, { recursive: true });
        fs.readdirSync(src).forEach((file) => {
          const srcFile = path.join(src, file);
          const destFile = path.join(dest, file);
          if (fs.lstatSync(srcFile).isDirectory()) {
            copyDir(srcFile, destFile);
          } else {
            fs.copyFileSync(srcFile, destFile);
          }
        });
      };
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  });
}

console.log("✅ Done");

// Clean up artifacts directory
console.log("🗑️  Cleaning up artifacts directory...");
clearDirectory(artifactsDir);
fs.rmdirSync(artifactsDir);
