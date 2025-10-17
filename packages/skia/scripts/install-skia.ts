import fs from "fs";
import https from "https";
import path from "path";
import { createGunzip } from "zlib";

import tar from "tar";

import { copyHeaders } from "./skia-configuration";

const repo = "shopify/react-native-skia";

// For now, we'll read the version from an environment variable or a config file
// This avoids the dependency on git and the external skia submodule
const getSkiaVersion = (): string => {
  // Check environment variable first
  if (process.env.SKIA_VERSION) {
    return process.env.SKIA_VERSION;
  }

  // Try to read from a version file
  const versionFile = path.join(__dirname, "..", "SKIA_VERSION");
  if (fs.existsSync(versionFile)) {
    return fs.readFileSync(versionFile, "utf8").trim();
  }

  throw new Error(
    "SKIA_VERSION environment variable or SKIA_VERSION file not found. " +
      "Please set SKIA_VERSION environment variable (e.g., SKIA_VERSION=m142)"
  );
};

const GRAPHITE = !!process.env.SK_GRAPHITE;
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

const skiaVersion = getSkiaVersion();
const releaseTag = `skia-${skiaVersion}`;
console.log(
  `📦 Downloading Skia prebuilt binaries for version: ${skiaVersion}`
);

// Helper function to make HTTPS requests with redirects
const httpsGet = (url: string): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    https
      .get(url, { headers: { "User-Agent": "node" } }, (res) => {
        if (res.statusCode === 302 || res.statusCode === 301) {
          // Follow redirect
          httpsGet(res.headers.location!).then(resolve).catch(reject);
          return;
        }

        if (res.statusCode !== 200) {
          reject(
            new Error(
              `Failed to download: ${res.statusCode} ${res.statusMessage}`
            )
          );
          return;
        }

        const chunks: Buffer[] = [];
        res.on("data", (chunk) => chunks.push(chunk));
        res.on("end", () => resolve(Buffer.concat(chunks)));
        res.on("error", reject);
      })
      .on("error", reject);
  });
};

// Helper function to download and extract a tar.gz file
const downloadAndExtract = async (
  url: string,
  destDir: string
): Promise<void> => {
  return new Promise((resolve, reject) => {
    https
      .get(url, { headers: { "User-Agent": "node" } }, (res) => {
        if (res.statusCode === 302 || res.statusCode === 301) {
          // Follow redirect
          downloadAndExtract(res.headers.location!, destDir)
            .then(resolve)
            .catch(reject);
          return;
        }

        if (res.statusCode !== 200) {
          reject(
            new Error(
              `Failed to download: ${res.statusCode} ${res.statusMessage}`
            )
          );
          return;
        }

        fs.mkdirSync(destDir, { recursive: true });

        const gunzip = createGunzip();
        const extract = tar.extract({ cwd: destDir });

        res
          .pipe(gunzip)
          .pipe(extract)
          .on("finish", resolve)
          .on("error", reject);
      })
      .on("error", reject);
  });
};

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

const main = async () => {
  console.log("🧹 Clearing existing artifacts...");
  clearDirectory(artifactsDir);

  console.log(`⬇️  Downloading release assets to ${artifactsDir}`);

  for (const artifactName of names) {
    const assetName = `${artifactName}-${releaseTag}.tar.gz`;
    const extractDir = path.join(artifactsDir, artifactName);
    const downloadUrl = `https://github.com/${repo}/releases/download/${releaseTag}/${assetName}`;

    console.log(`   Downloading ${assetName}...`);
    try {
      await downloadAndExtract(downloadUrl, extractDir);
      console.log(`   ✓ ${assetName} extracted`);
    } catch (error) {
      console.error(`   ✗ Failed to download ${assetName}:`, error);
      throw error;
    }
  }

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
  const appleSrcDir = path.join(
    artifactsDir,
    "skia-apple-xcframeworks",
    "apple"
  );
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
  copyHeaders();
};

// Run the main function
main().catch((error) => {
  console.error("❌ Error:", error);
  process.exit(1);
});
