import { exec, execSync } from "child_process";
import { exit } from "process";
const fs = require("fs");

export const executeCmdSync = (command: string) => {
  execSync(command, { stdio: "inherit", env: process.env });
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
      exit(1);
    });
  }
};

export const getDistFolder = () => "./dist";

export const ensureDistFolder = (dirPath: string) => {
  try {
    console.log(`Ensuring that ${dirPath} exists...`);
    return fs.mkdirSync(dirPath);
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
