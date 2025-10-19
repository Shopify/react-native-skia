import fs from "fs";
import https from "https";
import path from "path";
import os from "os";
import { spawn } from "child_process";

import { copyHeaders } from "./skia-configuration";

const repo = "shopify/react-native-skia";

const getSkiaVersion = (): string => {
  const packageJsonPath = path.join(__dirname, "..", "package.json");
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
  return packageJson.skiaVersion;
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

const runCommand = (command: string, args: string[]): Promise<void> => {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: ["ignore", "inherit", "inherit"],
    });
    child.on("error", (error) => {
      reject(error);
    });
    child.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command ${command} exited with code ${code}`));
      }
    });
  });
};

const downloadToFile = (url: string, destPath: string): Promise<void> => {
  fs.mkdirSync(path.dirname(destPath), { recursive: true });
  return new Promise((resolve, reject) => {
    const request = (currentUrl: string) => {
      https
        .get(currentUrl, { headers: { "User-Agent": "node" } }, (res) => {
          if (
            res.statusCode &&
            [301, 302, 303, 307, 308].includes(res.statusCode)
          ) {
            const { location } = res.headers;
            if (location) {
              res.resume();
              request(location);
            } else {
              reject(new Error(`Redirect without location for ${currentUrl}`));
            }
            return;
          }

          if (res.statusCode !== 200) {
            reject(
              new Error(
                `Failed to download: ${res.statusCode} ${res.statusMessage}`
              )
            );
            res.resume();
            return;
          }

          const fileStream = fs.createWriteStream(destPath);
          res.pipe(fileStream);

          fileStream.on("finish", () => {
            fileStream.close((err) => {
              if (err) {
                // If closing the stream errors, perform the same cleanup and reject.
                fileStream.destroy();
                fs.unlink(destPath, () => reject(err));
              } else {
                resolve();
              }
            });
          });

          const cleanup = (
            error: Error | NodeJS.ErrnoException | null | undefined
          ) => {
            fileStream.destroy();
            fs.unlink(destPath, () => reject(error));
          };

          res.on("error", cleanup);
          fileStream.on("error", cleanup);
        })
        .on("error", reject);
    };

    request(url);
  });
};

// On Windows, convert paths to avoid tar misinterpreting paths like C:\path
// as remote host connection specs (C: as hostname)
const normalizePathForTar = (filePath: string): string => {
  if (process.platform !== "win32") {
    return filePath;
  }

  // Convert backslashes to forward slashes
  let normalized = filePath.replace(/\\/g, "/");

  // Convert C:/path to /c/path for Git Bash tar compatibility
  normalized = normalized.replace(
    /^([A-Za-z]):\//,
    (_, drive) => `/${drive.toLowerCase()}/`
  );

  return normalized;
};

const extractTarGz = async (
  archivePath: string,
  destDir: string
): Promise<void> => {
  fs.mkdirSync(destDir, { recursive: true });

  const args = [
    "-xzf",
    normalizePathForTar(archivePath),
    "-C",
    normalizePathForTar(destDir),
  ];
  const candidates =
    process.platform === "win32"
      ? [
          "tar.exe",
          path.join(
            process.env.SystemRoot ?? "C:\\Windows",
            "System32",
            "tar.exe"
          ),
          "bsdtar.exe",
          "bsdtar",
        ]
      : ["tar"];

  let lastError: Error | undefined;
  for (const candidate of candidates) {
    try {
      await runCommand(candidate, args);
      return;
    } catch (error) {
      const err = error as NodeJS.ErrnoException;
      if (err.code === "ENOENT") {
        lastError = new Error(`Command ${candidate} not found`);
        continue;
      }
      lastError = err;
    }
  }

  throw new Error(
    `Failed to extract ${path.basename(
      archivePath
    )}. Please install a compatible tar binary. Last error: ${
      lastError?.message ?? "unknown error"
    }`
  );
};

// Helper function to download and extract a tar.gz file
const downloadAndExtract = async (
  url: string,
  destDir: string,
  tempDir: string
): Promise<void> => {
  const archivePath = path.join(tempDir, path.basename(url));
  await downloadToFile(url, archivePath);
  try {
    await extractTarGz(archivePath, destDir);
  } finally {
    if (fs.existsSync(archivePath)) {
      fs.unlinkSync(archivePath);
    }
  }
};

const artifactsDir = path.resolve(
  __dirname,
  "../../../packages/skia/artifacts"
);

const libsDir = path.resolve(__dirname, "../libs");

// Function to check if prebuilt binaries are already installed
const areBinariesInstalled = (): boolean => {
  if (!fs.existsSync(libsDir)) {
    return false;
  }

  // Check for Android libraries
  const androidDir = path.join(libsDir, "android");
  const androidArchs = ["armeabi-v7a", "arm64-v8a", "x86", "x86_64"];
  for (const arch of androidArchs) {
    const archDir = path.join(androidDir, arch);
    if (!fs.existsSync(archDir) || fs.readdirSync(archDir).length === 0) {
      return false;
    }
  }

  // Check for Apple frameworks
  const appleDir = path.join(libsDir, "apple");
  if (!fs.existsSync(appleDir) || fs.readdirSync(appleDir).length === 0) {
    return false;
  }

  return true;
};

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
  const forceReinstall = process.argv.includes("--force");
  const skipHeaders = process.argv.includes("--no-headers");

  // Check if binaries are already installed
  if (!forceReinstall && areBinariesInstalled()) {
    console.log("✅ Prebuilt binaries already installed, skipping download");
    console.log("   Use --force to reinstall");
    return;
  }

  if (forceReinstall) {
    console.log("🔄 Force reinstall requested");
  }
  if (skipHeaders) {
    console.log("⏭️  Skipping headers installation");
  }

  console.log("🧹 Clearing existing artifacts...");
  clearDirectory(artifactsDir);

  console.log(`⬇️  Downloading release assets to ${artifactsDir}`);
  const tempDownloadDir = fs.mkdtempSync(
    path.join(os.tmpdir(), "skia-download-")
  );

  for (const artifactName of names) {
    const assetName = `${artifactName}-${releaseTag}.tar.gz`;
    const extractDir = path.join(artifactsDir, artifactName);
    const downloadUrl = `https://github.com/${repo}/releases/download/${releaseTag}/${assetName}`;

    console.log(`   Downloading ${assetName}...`);
    try {
      await downloadAndExtract(downloadUrl, extractDir, tempDownloadDir);
      console.log(`   ✓ ${assetName} extracted`);
    } catch (error) {
      console.error(`   ✗ Failed to download ${assetName}:`, error);
      fs.rmSync(tempDownloadDir, { recursive: true, force: true });
      throw error;
    }
  }
  fs.rmSync(tempDownloadDir, { recursive: true, force: true });

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

  if (!skipHeaders) {
    copyHeaders();
  }
};

// Run the main function
main().catch((error) => {
  console.error("❌ Error:", error);
  process.exit(1);
});
