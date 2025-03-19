/* eslint-disable max-len */
import fs from "fs";
import path from "path";

import { $ } from "./utils";

const repo = "ExodusMovement/react-native-skia";
const workflow = "build-skia.yml";
const names = [
  "skia-android-arm",
  "skia-android-arm-64",
  "skia-android-arm-x64",
  "skia-android-arm-x86",
  "skia-apple-xcframeworks",
];
//const branch = "main";

const artifactsDir = path.resolve(
  __dirname,
  "../../../packages/skia/artifacts"
);

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
    console.log(`❌ ${directory}`);
  } else {
    console.log(`Directory ${directory} does not exist, creating it...`);
    fs.mkdirSync(directory, { recursive: true });
  }
};

const result = $(
  `gh run list --repo "${repo}" --workflow "${workflow}" --status success --limit 1 --json databaseId --jq '.[0].databaseId'`
);
const id = result.toString("utf8").trim();

console.log("Clearing existing artifacts...");
clearDirectory(artifactsDir);

console.log(`Downloading artifacts to ${artifactsDir}`);
names.forEach((artifactName) => {
  $(
    `gh run download "${id}" --repo "${repo}" --name "${artifactName}" --dir ${artifactsDir}/${artifactName}`
  );
});
console.log("Done");
