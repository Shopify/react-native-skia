import {
  executeCmdSync,
  checkFileExists,
  ensureFolderExists,
  getDistFolder,
} from "./utils";
import fs from "fs";
import { exit } from "process";
import { configurations } from "./skia-configuration";

const pck = JSON.parse(fs.readFileSync("./package/package.json").toString());

/**
 * This build script returns the filename of the npm package and
 * can be used to find the correct artifacts name. It is supposed
 * to be run after building the npm package where the package.json
 * file has been updated.
 */

// Copy package to the dist folder
const packageFilename = `shopify-react-native-skia-${pck.version}.tgz`;
const outputPath = `${getDistFolder()}/${packageFilename}`;

// Done!
console.log(outputPath);
exit(0);
