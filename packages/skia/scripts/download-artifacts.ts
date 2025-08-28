/* eslint-disable max-len */
import fs from "fs";
import path from "path";

import { $ } from "./utils";
import { GRAPHITE } from "./skia-configuration";

console.log(GRAPHITE ? "🗿 Skia Graphite" : "🐘 Skia Ganesh");

const repo = "shopify/react-native-skia";
const workflow = `build-skia${GRAPHITE ? "-graphite" : ""}.yml`;
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
//const branch = "main";

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

const result = $(
  `gh run list --repo "${repo}" --workflow "${workflow}" --status success --limit 1 --json databaseId --jq '.[0].databaseId'`
);
const id = result.toString("utf8").trim();

console.log("🧹 Clearing existing artifacts...");
clearDirectory(artifactsDir);

console.log(`⬇️  Downloading artifacts to ${artifactsDir}`);
console.log("📋 Artifacts to download:", names);
names.forEach((artifactName) => {
  $(
    `gh run download "${id}" --repo "${repo}" --name "${artifactName}" --dir ${artifactsDir}/${artifactName}`
  );
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
  const srcDir = path.join(artifactsDir, src);
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
const appleSrcDir = path.join(artifactsDir, "skia-apple-xcframeworks");
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
