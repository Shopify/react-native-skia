/*
	This script is used to increase react-native-skia version.
	It will update those files:
		- package/package.json (JavaScript)
    - README.md
    - docs/docs/getting-started/installation.md

	Parameters accepted: [ 'minor', 'major', 'patch' ].
*/

import fs from "fs";
import { exit } from "process";
import colors from "colors";
import { Command, Option } from "commander";

const ACCEPTABLE_ARGUMENT_VALUES = ["major", "minor", "patch"];
const JAVASCRIPT_FILE_PATH = `${__dirname}/../package/package.json`;
const README_FILE_PATH = `${__dirname}/../README.md`;
const WEBSITE_INSTALLATION_FILE_PATH = `${__dirname}/../docs/docs/getting-started/installation.md`;

const printDiff = (oldVersionName: string, newVersionName: string) => {
  console.log(colors.red("-> Old version <-"));
  console.log(colors.red(`Version name: ${oldVersionName}`));
  console.log(colors.green("-> New version <-"));
  console.log(colors.green(`Version name: ${newVersionName}`));
};

const updatePackageDotJsonVersion = (
  versionType: "major" | "minor" | "patch",
  packageDotJson: string
): string => {
  const pck = JSON.parse(fs.readFileSync(packageDotJson).toString());

  const oldJavascriptVersionName = pck.version.replace(/"/g, "");
  const versionToIncrease = pck.version;
  pck.version = increaseVersion(versionType, versionToIncrease);

  printDiff(oldJavascriptVersionName, pck.version);

  fs.writeFileSync(JAVASCRIPT_FILE_PATH, JSON.stringify(pck, null, 2));
  return pck.version;
};

const replaceInstallationCommandWithNewVersion = (
  document: string,
  startCommand: string,
  version: string
): string => {
  const allLineRegExp = new RegExp("^.*" + startCommand + ".*$", "gm");
  return document.replace(
    allLineRegExp,
    `${startCommand}/v${version}-alpha/shopify-react-native-skia-${version}.tgz`
  );
};

const updateDocVersion = (docPath: string, version: string) => {
  const docContent = fs.readFileSync(docPath).toString();
  const updatedDocWithYarn = replaceInstallationCommandWithNewVersion(
    docContent,
    "yarn add https://github.com/Shopify/react-native-skia/releases/download",
    version
  );
  const updatedDocWithNpm = replaceInstallationCommandWithNewVersion(
    updatedDocWithYarn,
    "npm install https://github.com/Shopify/react-native-skia/releases/download",
    version
  );

  fs.writeFileSync(docPath, updatedDocWithNpm);
};

export const increaseVersion = (
  versionType: "major" | "minor" | "patch",
  versionToIncrease: string
) => {
  let version = "";
  const splitVersion = versionToIncrease.split(".");

  switch (versionType) {
    case "major":
      version += `${+splitVersion[0] + 1}.0.0`;
      break;
    case "minor":
      version += `${splitVersion[0]}.${+splitVersion[1] + 1}.0`;
      break;
    case "patch":
      version += `${splitVersion[0]}.${splitVersion[1]}.${
        +splitVersion[2] + 1
      }`;
      break;
  }
  return version;
};

const program = new Command();

program
  .addOption(
    new Option("-r, --releaseType <type>", "Type of the upgrade").choices(
      ACCEPTABLE_ARGUMENT_VALUES
    )
  )
  .action((args) => {
    if (!args.releaseType) {
      console.log(
        "error: option '-r, --releaseType <type>' must be set. Allowed choices are major, minor, patch."
      );
      exit(1);
    }
    const newVersion = updatePackageDotJsonVersion(
      args.releaseType,
      JAVASCRIPT_FILE_PATH
    );
    updateDocVersion(README_FILE_PATH, newVersion);
    updateDocVersion(WEBSITE_INSTALLATION_FILE_PATH, newVersion);
  });

program.parse(process.argv);
