import fs from "fs";
import https from "https";
import path from "path";
import os from "os";
import crypto from "crypto";
import { spawn } from "child_process";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repo = "shopify/react-native-skia";

const getPackageJsonPath = () => path.join(__dirname, "..", "package.json");
const getPackageJson = () => JSON.parse(fs.readFileSync(getPackageJsonPath(), "utf8"));
const writePackageJson = (json) => {
  fs.writeFileSync(getPackageJsonPath(), JSON.stringify(json, null, 2) + "\n");
};

const getSkiaVersion = () => {
  const pkg = getPackageJson();
  return pkg.skia?.version ?? pkg.skiaVersion;
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
if (GRAPHITE) names.push(`${prefix}-headers`);

const skiaVersion = getSkiaVersion();
const releaseTag = GRAPHITE ? `skia-graphite-${skiaVersion}` : `skia-${skiaVersion}`;
console.log(`📦 Installing Skia prebuilt binaries (version: ${skiaVersion})`);

const runCommand = (command, args) =>
  new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: ["ignore", "inherit", "inherit"] });
    child.on("error", reject);
    child.on("close", (code) => (code === 0 ? resolve() : reject(new Error(`Command ${command} exited with code ${code}`))));
  });

const downloadToFile = (url, destPath) =>
  new Promise((resolve, reject) => {
    fs.mkdirSync(path.dirname(destPath), { recursive: true });
    https
      .get(url, { headers: { "User-Agent": "node" } }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          return downloadToFile(res.headers.location, destPath).then(resolve).catch(reject);
        }
        if (res.statusCode !== 200) return reject(new Error(`Failed to download ${url}: ${res.statusCode}`));
        const file = fs.createWriteStream(destPath);
        res.pipe(file);
        file.on("finish", () => file.close(resolve));
        file.on("error", reject);
      })
      .on("error", reject);
  });

const extractTarGz = async (archivePath, destDir) => {
  fs.mkdirSync(destDir, { recursive: true });
  await runCommand(process.platform === "win32" ? "tar.exe" : "tar", ["-xzf", archivePath, "-C", destDir]);
};

const downloadAndExtract = async (url, destDir, tempDir) => {
  const archivePath = path.join(tempDir, path.basename(url));
  await downloadToFile(url, archivePath);
  await extractTarGz(archivePath, destDir);
  fs.unlinkSync(archivePath);
};

const artifactsDir = path.resolve(__dirname, "../../../packages/skia/artifacts");
const libsDir = path.resolve(__dirname, "../libs");

const clearDirectory = (directory) => {
  if (!fs.existsSync(directory)) return;
  fs.readdirSync(directory).forEach((file) => {
    const curPath = path.join(directory, file);
    if (fs.lstatSync(curPath).isDirectory()) {
      clearDirectory(curPath);
      fs.rmdirSync(curPath);
    } else fs.unlinkSync(curPath);
  });
};

const hashDirectory = async (dir) => {
  const hash = crypto.createHash("sha256");
  const walk = (d) => {
    for (const entry of fs.readdirSync(d)) {
      const p = path.join(d, entry);
      const stat = fs.statSync(p);
      if (stat.isDirectory()) {
        walk(p);
      } else {
        hash.update(entry);
        hash.update(String(stat.size));
        hash.update(fs.readFileSync(p));
      }
    }
  };
  if (fs.existsSync(dir)) walk(dir);
  return hash.digest("hex");
};

const computeInstallChecksums = async () => {
  const checksums = {};
  const androidDir = path.join(libsDir, "android");
  if (fs.existsSync(androidDir)) {
    for (const arch of fs.readdirSync(androidDir)) {
      const subdir = path.join(androidDir, arch);
      checksums[`android-${arch}`] = await hashDirectory(subdir);
    }
  }
  const appleDir = path.join(libsDir, "apple");
  if (fs.existsSync(appleDir)) {
    checksums["apple-xcframeworks"] = await hashDirectory(appleDir);
  }
  return checksums;
};

const isInstallUpToDate = async (storedChecksums) => {
  if (!storedChecksums || Object.keys(storedChecksums).length === 0) {
    return false;
  }
  const currentChecksums = await computeInstallChecksums();
  for (const [key, stored] of Object.entries(storedChecksums)) {
    if (stored !== currentChecksums[key]) return false;
  }
  return Object.keys(currentChecksums).length > 0;
};

const main = async () => {
  const pkg = getPackageJson();
  const storedChecksums = pkg.skia?.checksums ?? {};

  if (await isInstallUpToDate(storedChecksums)) {
    console.log("✅ Local Skia installation verified via checksum — skipping download.");
    return;
  }

  console.log("⬇️  Downloading Skia release assets...");
  clearDirectory(artifactsDir);
  const tempDownloadDir = fs.mkdtempSync(path.join(os.tmpdir(), "skia-download-"));

  for (const artifactName of names) {
    const assetName = `${artifactName}-${releaseTag}.tar.gz`;
    const extractDir = path.join(artifactsDir, artifactName);
    const downloadUrl = `https://github.com/${repo}/releases/download/${releaseTag}/${assetName}`;
    console.log(`   Downloading ${assetName}...`);
    await downloadAndExtract(downloadUrl, extractDir, tempDownloadDir);
    console.log(`   ✓ ${assetName} extracted`);
  }

  fs.rmSync(tempDownloadDir, { recursive: true, force: true });

  // --- Copy logic identical to before (omitted for brevity) ---

  console.log("📦 Computing install checksums...");
  const newChecksums = await computeInstallChecksums();

  pkg.skia = {
    version: skiaVersion,
    checksums: newChecksums,
  };
  writePackageJson(pkg);
  console.log("   ✓ Checksums written to package.json");

  console.log("✅ Completed installation of Skia prebuilt binaries.");
  clearDirectory(artifactsDir);
  fs.rmdirSync(artifactsDir);
};

main().catch((error) => {
  console.error("❌ Error:", error);
  process.exit(1);
});
