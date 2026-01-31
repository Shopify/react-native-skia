/**
 * Postinstall script for Skia binary packages.
 * Downloads the prebuilt binary from GitHub releases and extracts it.
 *
 * This file is copied to each generated binary package.
 */

import fs from "fs";
import https from "https";
import path from "path";
import { spawn } from "child_process";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Read package configuration
const packageJsonPath = path.join(__dirname, "package.json");
const pkg = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));

const { releaseTag, assetName } = pkg.skia;
const repo = "shopify/react-native-skia";
const libsDir = path.join(__dirname, "libs");

// Check if already installed
if (fs.existsSync(libsDir) && fs.readdirSync(libsDir).length > 0) {
  console.log(`✅ ${pkg.name}: Binaries already installed`);
  process.exit(0);
}

console.log(`📦 ${pkg.name}: Downloading Skia binary...`);
console.log(`   Release: ${releaseTag}`);
console.log(`   Asset: ${assetName}`);

const runCommand = (command, args, options = {}) => {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: ["ignore", "inherit", "inherit"],
      ...options,
    });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command ${command} exited with code ${code}`));
      }
    });
  });
};

const downloadToFile = (url, destPath, maxRetries = 5) => {
  fs.mkdirSync(path.dirname(destPath), { recursive: true });

  const attemptDownload = (retryCount = 0) => {
    return new Promise((resolve, reject) => {
      const request = (currentUrl) => {
        https
          .get(currentUrl, { headers: { "User-Agent": "node" } }, (res) => {
            // Handle redirects
            if (res.statusCode && [301, 302, 303, 307, 308].includes(res.statusCode)) {
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
              const error = new Error(
                `Failed to download: ${res.statusCode} ${res.statusMessage}`
              );
              error.statusCode = res.statusCode;
              res.resume();
              reject(error);
              return;
            }

            const file = fs.createWriteStream(destPath);
            res.pipe(file);

            file.on("finish", () => {
              file.close();
              resolve();
            });

            file.on("error", (err) => {
              fs.unlink(destPath, () => {});
              reject(err);
            });
          })
          .on("error", reject);
      };

      request(url);
    });
  };

  const retryWithBackoff = async () => {
    for (let i = 0; i <= maxRetries; i++) {
      try {
        return await attemptDownload(i);
      } catch (error) {
        if (i === maxRetries) {
          throw error;
        }
        const delay = Math.pow(2, i) * 1000;
        console.log(`   Retry ${i + 1}/${maxRetries} in ${delay / 1000}s...`);
        await new Promise((r) => setTimeout(r, delay));
      }
    }
  };

  return retryWithBackoff();
};

const extractTarGz = async (archivePath, destDir) => {
  fs.mkdirSync(destDir, { recursive: true });

  const args = ["-xzf", archivePath, "-C", destDir];
  const candidates =
    process.platform === "win32"
      ? ["tar.exe", path.join(process.env.SystemRoot ?? "C:\\Windows", "System32", "tar.exe")]
      : ["tar"];

  let lastError;
  for (const candidate of candidates) {
    try {
      await runCommand(candidate, args);
      return;
    } catch (err) {
      if (err.code === "ENOENT") {
        lastError = new Error(`Command ${candidate} not found`);
        continue;
      }
      throw err;
    }
  }

  throw new Error(`Failed to extract: ${lastError?.message ?? "unknown error"}`);
};

const main = async () => {
  const tempDir = path.join(__dirname, ".tmp");
  const downloadUrl = `https://github.com/${repo}/releases/download/${releaseTag}/${assetName}`;
  const archivePath = path.join(tempDir, assetName);

  try {
    // Download
    console.log(`   Downloading from GitHub releases...`);
    await downloadToFile(downloadUrl, archivePath);

    // Extract
    console.log(`   Extracting...`);
    await extractTarGz(archivePath, libsDir);

    // Cleanup
    fs.rmSync(tempDir, { recursive: true, force: true });

    console.log(`✅ ${pkg.name}: Binary installed successfully`);
  } catch (error) {
    // Cleanup on error
    fs.rmSync(tempDir, { recursive: true, force: true });
    fs.rmSync(libsDir, { recursive: true, force: true });

    console.error(`❌ ${pkg.name}: Failed to install binary`);
    console.error(`   ${error.message}`);
    console.error(`   URL: ${downloadUrl}`);
    process.exit(1);
  }
};

main();
