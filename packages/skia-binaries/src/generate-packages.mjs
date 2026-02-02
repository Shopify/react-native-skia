/**
 * Script to generate individual Skia binary npm packages.
 *
 * Usage:
 *   node generate-packages.mjs --skia-version=m144b --npm-version=144.2.0
 *   node generate-packages.mjs --package=android-arm64 --skia-version=m144b --npm-version=144.2.0
 *
 * Options:
 *   --package       Generate only a specific package (optional, generates all if omitted)
 *   --skia-version  Skia milestone version (e.g., m144b)
 *   --npm-version   NPM package version (e.g., 144.2.0)
 *   --graphite      Generate Graphite packages instead of Ganesh
 *   --output-dir    Output directory (default: ./dist)
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.join(__dirname, "..");

// Package configurations
const GANESH_PACKAGES = [
  {
    name: "android-arm",
    artifact: "skia-android-arm",
    platform: "android",
    arch: "arm",
  },
  {
    name: "android-arm64",
    artifact: "skia-android-arm-64",
    platform: "android",
    arch: "arm64",
  },
  {
    name: "android-x86",
    artifact: "skia-android-arm-x86",
    platform: "android",
    arch: "x86",
  },
  {
    name: "android-x64",
    artifact: "skia-android-arm-x64",
    platform: "android",
    arch: "x64",
  },
  {
    name: "apple-ios",
    artifact: "skia-apple-ios-xcframeworks",
    platform: "apple",
    arch: "ios",
  },
  {
    name: "apple-tvos",
    artifact: "skia-apple-tvos-xcframeworks",
    platform: "apple",
    arch: "tvos",
  },
  {
    name: "apple-macos",
    artifact: "skia-apple-macos-xcframeworks",
    platform: "apple",
    arch: "macos",
  },
];

const GRAPHITE_PACKAGES = [
  {
    name: "android-arm",
    artifact: "skia-android-arm",
    platform: "android",
    arch: "arm",
  },
  {
    name: "android-arm64",
    artifact: "skia-android-arm-64",
    platform: "android",
    arch: "arm64",
  },
  {
    name: "android-x86",
    artifact: "skia-android-arm-x86",
    platform: "android",
    arch: "x86",
  },
  {
    name: "android-x64",
    artifact: "skia-android-arm-x64",
    platform: "android",
    arch: "x64",
  },
  {
    name: "apple-ios",
    artifact: "skia-apple-ios-xcframeworks",
    platform: "apple",
    arch: "ios",
  },
  {
    name: "apple-macos",
    artifact: "skia-apple-macos-xcframeworks",
    platform: "apple",
    arch: "macos",
  },
  {
    name: "headers",
    artifact: "skia-wasm-headers",
    platform: "common",
    arch: "headers",
  },
];

const parseArgs = () => {
  const args = {};
  for (const arg of process.argv.slice(2)) {
    if (arg.startsWith("--")) {
      const [key, value] = arg.slice(2).split("=");
      args[key] = value ?? true;
    }
  }
  return args;
};

const generatePackageJson = (pkg, skiaVersion, npmVersion, graphite) => {
  const prefix = graphite ? "skia-graphite" : "skia";
  const releaseTag = graphite ? `skia-graphite-${skiaVersion}` : `skia-${skiaVersion}`;
  const assetName = `${pkg.artifact}-${releaseTag}.tar.gz`;

  return {
    name: `@shopify/${prefix}-${pkg.name}`,
    version: npmVersion,
    description: `Skia prebuilt binary for ${pkg.platform} ${pkg.arch}${graphite ? " (Graphite)" : ""}`,
    license: "MIT",
    repository: {
      type: "git",
      url: "https://github.com/Shopify/react-native-skia.git",
      directory: `packages/skia-binaries/dist/${graphite ? "graphite" : "ganesh"}/${pkg.name}`,
    },
    publishConfig: {
      access: "public",
      provenance: true,
    },
    files: ["libs/**", "postinstall.mjs"],
    scripts: {
      postinstall: "node postinstall.mjs",
    },
    skia: {
      platform: pkg.platform,
      arch: pkg.arch,
      releaseTag,
      assetName,
      graphite,
    },
  };
};

const generatePackage = (pkg, outputDir, skiaVersion, npmVersion, graphite) => {
  const pkgDir = path.join(outputDir, graphite ? "graphite" : "ganesh", pkg.name);

  // Create package directory
  fs.mkdirSync(pkgDir, { recursive: true });

  // Generate package.json
  const packageJson = generatePackageJson(pkg, skiaVersion, npmVersion, graphite);
  fs.writeFileSync(
    path.join(pkgDir, "package.json"),
    JSON.stringify(packageJson, null, 2) + "\n"
  );

  // Copy postinstall script
  const postinstallSrc = path.join(ROOT_DIR, "src", "postinstall.mjs");
  const postinstallDest = path.join(pkgDir, "postinstall.mjs");
  fs.copyFileSync(postinstallSrc, postinstallDest);

  // Create empty libs directory
  fs.mkdirSync(path.join(pkgDir, "libs"), { recursive: true });

  console.log(`  Generated: ${packageJson.name}@${npmVersion}`);
  return pkgDir;
};

const main = () => {
  const args = parseArgs();

  if (!args["skia-version"]) {
    console.error("Error: --skia-version is required");
    console.error("Usage: node generate-packages.mjs --skia-version=m144b --npm-version=144.2.0");
    process.exit(1);
  }

  if (!args["npm-version"]) {
    console.error("Error: --npm-version is required");
    console.error("Usage: node generate-packages.mjs --skia-version=m144b --npm-version=144.2.0");
    process.exit(1);
  }

  const skiaVersion = args["skia-version"];
  const npmVersion = args["npm-version"];
  const graphite = args.graphite === true;
  const outputDir = args["output-dir"] || path.join(ROOT_DIR, "dist");
  const specificPackage = args.package;

  const packages = graphite ? GRAPHITE_PACKAGES : GANESH_PACKAGES;
  const packagesToGenerate = specificPackage
    ? packages.filter((p) => p.name === specificPackage)
    : packages;

  if (specificPackage && packagesToGenerate.length === 0) {
    console.error(`Error: Package "${specificPackage}" not found`);
    console.error(`Available packages: ${packages.map((p) => p.name).join(", ")}`);
    process.exit(1);
  }

  console.log(`Generating ${graphite ? "Graphite" : "Ganesh"} binary packages...`);
  console.log(`  Skia version: ${skiaVersion}`);
  console.log(`  NPM version: ${npmVersion}`);
  console.log(`  Output: ${outputDir}`);
  console.log("");

  const generatedDirs = [];
  for (const pkg of packagesToGenerate) {
    const pkgDir = generatePackage(pkg, outputDir, skiaVersion, npmVersion, graphite);
    generatedDirs.push(pkgDir);
  }

  console.log("");
  console.log(`Generated ${generatedDirs.length} package(s)`);

  // Output generated directories for use in CI
  if (process.env.GITHUB_OUTPUT) {
    const output = generatedDirs.join("\n");
    fs.appendFileSync(process.env.GITHUB_OUTPUT, `packages=${output}\n`);
  }
};

main();
