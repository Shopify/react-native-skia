import { exec, execSync } from "child_process";
import { exit } from "process";
import path from "path";
import fs from "fs";

export const executeCmdSync = (command: string) => {
  try {
    return execSync(command);
  } catch (e) {
    exit(1);
  }
};

export const executeCmd = (
  command: string,
  label: string,
  callback: () => void
) => {
  const proc = exec(command, { env: process.env }, callback);
  if (proc) {
    proc.stdout?.on("data", function (data) {
      console.log(`[${label}]:`, data.trim());
    });
    proc.stderr?.on("data", function (data) {
      console.error(`[${label}]:`, data.trim());
    });
    proc.on("close", function (code) {
      if (code) {
        console.log(`[${label}] exited with code ${code}`);
        exit(code);
      }
    });
  }
};

export const getDistFolder = () => "./dist";

export const ensureFolderExists = (dirPath: string) => {
  try {
    console.log(`Ensuring that ${dirPath} exists...`);
    return fs.mkdirSync(dirPath, { recursive: true });
  } catch (err) {
    // @ts-ignore
    if (err.code !== "EEXIST") throw err;
  }
};

export const checkFileExists = (
  filePath: string,
  message: string,
  error: string
) => {
  const exists = fs.existsSync(filePath);
  if (!exists) {
    console.log("");
    console.log("Failed:");
    console.log(message + " not found. (" + filePath + ")");
    console.log(error);
    console.log("");
    exit(1);
  } else {
    console.log("☑ " + message);
  }
};

const getBackupFilename = (filePath: string) => filePath + ".bak";

export const backupAndCopyFile = (
  filePathToBeReplacedAndBackedUp: string,
  filePathToCopy: string
) => {
  // Back up and replace
  console.log(`Backing up and replacing ${filePathToBeReplacedAndBackedUp}...`);
  const backupFilePath = getBackupFilename(filePathToBeReplacedAndBackedUp);
  fs.renameSync(filePathToBeReplacedAndBackedUp, backupFilePath);

  // Copy the Package file from the npm folder
  fs.copyFileSync(filePathToCopy, filePathToBeReplacedAndBackedUp);
};

export const restoreFile = (filePathToBeRestored: string) => {
  console.log(`Restoring ${getBackupFilename(filePathToBeRestored)}...`);
  fs.unlinkSync(filePathToBeRestored);
  fs.renameSync(getBackupFilename(filePathToBeRestored), filePathToBeRestored);
};

/**
 * Look ma, it's cp -R.
 * @param {string} src  The path to the thing to copy.
 * @param {string} dest The path to the new copy.
 */
export var copyRecursiveSync = function (src: string, dest: string) {
  var exists = fs.existsSync(src);
  if (!exists) {
    return;
  }
  var stats = fs.statSync(src);
  var isDirectory = stats.isDirectory();
  if (isDirectory) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest);
    }
    fs.readdirSync(src).forEach((childItemName) => {
      copyRecursiveSync(
        path.join(src, childItemName),
        path.join(dest, childItemName)
      );
    });
  } else {
    fs.copyFileSync(src, dest);
  }
};
