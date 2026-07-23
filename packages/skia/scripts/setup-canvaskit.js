#!/usr/bin/env node

/**
 * A script to automate the setup of `@shopify/react-native-skia` for web.
 * The only requirement is that your project supports a 'static' folder (often named '/public').
 * In `@expo/webpack-config` this is `./web` (default for now).
 *
 * This script does the following:
 * 0. Try to detect if it's an expo project and if the bundler is set to metro
 * 1. Resolve the public path relative to wherever the script is being run.
 * 2. Log out some useful info about the web setup, just in case anything goes wrong.
 * 3. Resolve the CanvasKit WASM bundled with `@shopify/react-native-skia`.
 * 4. Recursively ensure the path exists and copy the file into the desired location.
 *
 *
 * Usage:
 * $ `npx <script>`
 *
 * On webpack:
 * -> Copies the file to `<project>/web/static/js/canvaskit.wasm`
 * on metro:
 * -> Copies the file to `<project>/public/canvaskit.wasm`
 *
 * Tooling that uses a custom static assets folder, like `/assets` for example:
 * $ `npx <script> assets`
 *
 * -> Copies the file to `<project>/assets/canvaskit.wasm`
 *
 */
const fs = require("fs");
const path = require("path");

const args = process.argv.slice(2);

const gray = (text) => `\x1b[90m${text}\x1b[0m`;
const lime = (text) => `\x1b[32m${text}\x1b[0m`;

function getWetherItsAnExpoProjectWithMetro() {
  try {
    const appJsonPath = path.join(process.cwd(), "app.json");

    console.log(
      `› Reading Expo settings from (if any):\n  ${gray(appJsonPath)}`
    );

    const appJson = require(appJsonPath);
    const isAnExpoProjectWithMetro =
      appJson.expo && appJson.expo.web && appJson.expo.web.bundler === "metro";
    if (isAnExpoProjectWithMetro) {
      console.log(`  ${gray("Expo project with metro bundler detected")}\n`);
      return true;
    } else {
      console.log(
        `  ${gray(
          `Metro bundler not detected. Assuming the project is using Webpack.`
        )}\n`
      );
      return false;
    }
  } catch (error) {
    console.log(`  ${gray("No Expo settings found")}\n`);
    return false;
  }
}

function getWasmFilePath() {
  const wasmPath = path.resolve(__dirname, "../dist/canvaskit/canvaskit.wasm");
  if (!fs.existsSync(wasmPath)) {
    console.error(
      `Could not find the CanvasKit WASM bundled with '@shopify/react-native-skia': ${wasmPath}`
    );
    process.exit(1);
  }
  return wasmPath;
}

function getOutputFilePath(isAnExpoProjectWithMetro) {
  // Default to using `web` public path.
  const publicFolder = path.resolve(
    args[0] || (isAnExpoProjectWithMetro ? "public" : "web/static/js")
  );
  const publicLocation = "./canvaskit.wasm";
  const output = path.join(publicFolder, publicLocation);

  console.log(
    `› Copying 'canvaskit.wasm' file to public folder:\n  ${gray(output)}\n`
  );
  return output;
}

function copyFile(from, to) {
  const data = fs.readFileSync(from);
  fs.mkdirSync(path.dirname(to), { recursive: true });
  fs.writeFileSync(to, data);
}

(() => {
  // Automatically detect if it's an expo project with a metro bundler
  const isAnExpoProjectWithMetro = getWetherItsAnExpoProjectWithMetro();

  // Copy the WASM file to `<static>/canvaskit.wasm`
  copyFile(getWasmFilePath(), getOutputFilePath(isAnExpoProjectWithMetro));

  console.log(lime("› Success! You are almost there:"));
  console.log(
    gray(
      `› To load React Native Skia Web,
follow these instructions: https://shopify.github.io/react-native-skia/docs/getting-started/web`
    )
  );
})();
