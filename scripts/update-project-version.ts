/*
	This script is used to update react-native-skia version.
	It will update those files:
		- package/package.json
    - README.md
    - docs/docs/getting-started/installation.md
*/

import colors from "colors";
import { Command } from "commander";
import fs from "fs";

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
  version: string,
  packageDotJson: string
): string => {
  const pck = JSON.parse(fs.readFileSync(packageDotJson).toString());

  const oldJavascriptVersionName = pck.version.replace(/"/g, "");
  pck.version = version;

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

const program = new Command();

program
  .requiredOption(
    "-r, --releaseVersion <type>",
    "New version of react-native-skia"
  )
  .action((args) => {
    const newVersion = updatePackageDotJsonVersion(
      args.releaseVersion,
      JAVASCRIPT_FILE_PATH
    );
    updateDocVersion(README_FILE_PATH, newVersion);
    updateDocVersion(WEBSITE_INSTALLATION_FILE_PATH, newVersion);
  });

program.parse(process.argv);
