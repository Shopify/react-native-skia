import {
  executeCmdSync,
  checkFileExists,
  ensureFolderExists,
  getDistFolder,
} from "./utils";
import fs from "fs";
import { exit } from "process";

const pck = JSON.parse(fs.readFileSync("./package/package.json").toString());

/**
 * This build script returns the version of the npm package. It is supposed
 * to be run after building the npm package where the package.json
 * file has been updated.
 */

// Done!
console.log(pck.version);
exit(0);
