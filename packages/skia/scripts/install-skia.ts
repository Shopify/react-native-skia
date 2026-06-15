/**
 * Set up the standard (Ganesh) Skia build for development.
 *
 * Unlike `install-skia-graphite`, this script does NOT download or copy any
 * prebuilt binaries. The standard binaries ship in the `react-native-skia-android`
 * and `react-native-skia-apple-*` npm packages and are resolved straight from
 * node_modules by build.gradle (Android, read in place) and the podspec (Apple,
 * copied in at `pod install`). This replaces the work the old npm `postinstall`
 * script used to do.
 *
 * It only needs to:
 *   1. Undo a previous Graphite install by removing the `libs/.graphite` marker,
 *      so the native build systems switch back to the standard binaries.
 *   2. Copy the Skia headers required to compile against the prebuilt libraries.
 *
 * It deliberately leaves the contents of `libs/` in place, since `yarn build-skia`
 * writes locally-built binaries there.
 */
import { existsSync, rmSync } from "fs";
import path from "path";

import { copyHeaders } from "./skia-configuration";

const graphiteMarker = path.resolve(__dirname, "..", "libs", ".graphite");

if (existsSync(graphiteMarker)) {
  console.log("-- Removing Graphite marker (switching to the standard build)");
  rmSync(graphiteMarker, { force: true });
}

console.log("-- Copying Skia headers");
copyHeaders();

console.log(
  "✅ Standard Skia build ready. Prebuilt binaries are resolved from node_modules."
);
