#!/usr/bin/env node
/* eslint-disable max-len */

/**
 * A script to automate the setup of `@shopify/react-native-skia` for web.
 * The only requirement is that your project supports a 'static' folder (often named '/public').
 * In `@expo/webpack-config` this is `./web` (default for now).
 *
 * This script does the following:
 * 0. Try to detect if it's an expo project and if the bundler is set to metro
 * 1. Resolve the public path relative to wherever the script is being run.
 * 2. Log out some useful info about the web setup, just in case anything goes wrong.
 * 3. Resolve the installed wasm file `canvaskit-wasm/bin/full/canvaskit.wasm`
 *  from `@shopify/react-native-skia -> canvaskit`.
 * 4. Recursively ensure the path exists and copy the file into the desired location.
 * 5. OPTIONAL: If the metro bundler is detected, it updates the canvaskit package.json to resolve fs and path binary (necessary when bundling with metro)
 *
 *
 * Usage:
 * $ `npx <script>`
 *
 * -> Copies the file to `<project>/web/static/js/canvaskit.wasm`
 * OR, if metro is detected, to `<project>/public/static/js/canvaskit.wasm` and update the canvas-kit package.json accordingly.
 *
 * Tooling that uses `/public`:
 * $ `npx <script> public`
 *
 * -> Copies the file to `<project>/public/static/js/canvaskit.wasm`
 *
 */
const fs = require("fs");
const path = require("path");

const args = process.argv.slice(2);

const gray = (text) => `\x1b[90m${text}\x1b[0m`;
const lime = (text) => `\x1b[32m${text}\x1b[0m`;

function getWetherItsAnExpoProjectWithMetro() {
  try {
    const appJsonPath = path.join(process.cwd(), 'app.json');

    console.log(
      `› Reading Expo settings from (if any):\n  ${gray(appJsonPath)}`
    );

    const appJson = require(appJsonPath);
    const isAnExpoProjectWithMetro = appJson.expo && appJson.expo.web && appJson.expo.web.bundler === 'metro';
    if (isAnExpoProjectWithMetro) {
      console.log(`  ${gray(`Expo project with metro bundler detected`)}\n`);
      return true;
    } else {
      console.log(`  ${gray(`Metro bundler not detected. Assuming the project is using Webpack.`)}\n`);
      return false;
    }
  } catch (error) {
    console.log(`  ${gray(`No Expo settings found`)}\n`);
    return false;
  }
}

function getWasmFilePath() {
  try {
    return require.resolve("canvaskit-wasm/bin/full/canvaskit.wasm");
  } catch (error) {
    console.error(
      `Could not find 'canvaskit-wasm'. Please install '@shopify/react-native-skia' and ensure it can be resolved from your project: ${process.cwd()}`
    );
    process.exit(1);
  }
}

function getOutputFilePath(isAnExpoProjectWithMetro) {
  // Default to using `web` public path.
  const publicFolder = path.resolve(args[0] || (isAnExpoProjectWithMetro) ? "public" : "web");
  const publicLocation = "./static/js/canvaskit.wasm";
  const output = path.join(publicFolder, publicLocation);

  console.log(
    `› Copying 'canvaskit.wasm' file to static folder:\n  ${gray(output)}\n`
  );
  return output;
}

function copyFile(from, to) {
  const data = fs.readFileSync(from);
  fs.mkdirSync(path.dirname(to), { recursive: true });
  fs.writeFileSync(to, data);
}

function resolveFsAndPath() {
  try {
    const canvasKitPackageJsonPath = path.join(process.cwd(), 'node_modules', /* '@shopify', 'react-native-skia', 'node_modules', */ 'canvaskit-wasm', 'package.json');

    console.log(
      `› Optionnal metro bundler step:\n  ${gray(`Loading 'canvaskit-wasm' package.json from:\n  ${canvasKitPackageJsonPath}`)}`
    );

    const canvasKitPackageJson = require(canvasKitPackageJsonPath);
    // eslint-disable-next-line import/no-dynamic-require
    canvasKitPackageJson.browser = {
      fs: false,
      path: false,
      os: false,
    };
    
    console.log(`  ${gray(`Saving the updated 'canvaskit-wasm' package.json to resolve 'fs' and 'path' modules.`)}\n`);
    
    fs.writeFileSync(
      canvasKitPackageJsonPath,
      JSON.stringify(canvasKitPackageJson, null, 2)
    );
  } catch (error) {
    // console.error(
    //   `Could not update 'canvaskit-wasm' package.json to disable 'fs' and 'path' modules. Please install '@shopify/react-native-skia' and ensure it can be resolved from your project: ${process.cwd()}`
    // );
    console.log(error);
    process.exit(1);
  }
}

(() => {
  // Automatically detect if it's an expo project with a metro bundler
  const isAnExpoProjectWithMetro = getWetherItsAnExpoProjectWithMetro();

  // Copy the WASM file to `<static>/static/js/canvaskit.wasm`
  copyFile(getWasmFilePath(), getOutputFilePath(isAnExpoProjectWithMetro));

  // Resolve fs and path modules for metro bundler
  if (isAnExpoProjectWithMetro === true) {
    resolveFsAndPath();
  }

  console.log(lime("› Success! You are almost there:"));
  console.log(
    gray(
      "› To load React Native Skia Web, follow these instructions : https://shopify.github.io/react-native-skia/docs/getting-started/web"
    )
  );
})();
