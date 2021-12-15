import { executeCmd, executeCmdSync } from "./utils";
import { exit } from "process";
import { commonArgs, configurations, PlatformName } from "./skia-configuration";
const fs = require("fs");
const typedKeys = <T>(obj: T) => Object.keys(obj) as (keyof T)[];

/**
 * This build script builds the Skia Binaries from the Skia repositories
 * that are added as submodules to this repo. Both the Skia repo and
 * the depottools (build tools) for building is included.
 *
 * The build script does not have any other requirements than that the
 * Android NDK should be installed.
 *
 * This build script is run by the build-skia.yml github workflow
 *
 * Arguments:
 * @param platform the current platform as defined in the file skia-configuration.ts
 * @param cpu the cpu platform as defined in the file skia-configuration.ts
 *
 */

console.log("Starting SKIA Build.");
console.log("");

// Test for existence of Android SDK
if (!process.env.ANDROID_NDK) {
  console.log("ANDROID_NDK not set.");
  exit(1);
} else {
  console.log("☑ ANDROID_NDK");
}

if (process.argv.length !== 4) {
  console.log("Missing platform/cpu arguments");
  console.log("Available platforms:");
  console.log("");
  typedKeys(configurations).forEach((platform) => {
    console.log(platform);
    const config = configurations[platform];
    config.cpus.forEach((cpu) => console.log("  " + cpu));
  });
  exit(1);
}

const currentDir = process.cwd();
const SkiaDir = "./externals/skia";
const SelectedPlatform = process.argv[2] ?? "";
const SelectedCpu = process.argv[3] ?? "";

if (SkiaDir === undefined) {
  throw new Error("No Skia root directory specified.");
}

const getOutDir = (platform: PlatformName, cpu: string) => {
  return `out/${platform}/${cpu}`;
};

const configurePlatform = (platform: PlatformName, cpu: string) => {
  console.log(`Configuring platform "${platform}" for cpu "${cpu}"`);
  console.log("Current directory", process.cwd());

  const configuration = configurations[platform];
  if (configuration) {
    const commandline = `PATH=../depot_tools/:$PATH gn gen ${getOutDir(
      platform,
      cpu
    )}`;

    const args = configuration.args.reduce(
      (a, cur) => (a += `${cur[0]}=${cur[1]} `),
      ""
    );

    const common = commonArgs.reduce(
      (a, cur) => (a += `${cur[0]}=${cur[1]} `),
      ""
    );

    const command = `${commandline} --args='target_os="${platform}" target_cpu="${cpu}" ${common} ${args}'`;
    console.log(command);
    executeCmdSync(command);
    return true;
  } else {
    console.log(
      `Could not find platform "${platform}" for targetCpu "${cpu}" `
    );
    return false;
  }
};

const buildPlatform = (
  platform: PlatformName,
  cpu: string,
  callback: () => void
) => {
  console.log(`Building platform "${platform}" for cpu "${cpu}"`);
  executeCmd(
    `ninja -C ${getOutDir(platform, cpu)}`,
    `${platform}/${cpu}`,
    callback
  );
};

const processOutput = (platform: PlatformName, cpu: string) => {
  console.log(`Copying output for platform "${platform}" and cpu "${cpu}"`);
  const source = getOutDir(platform, cpu);
  const configuration = configurations[platform];
  if (configuration) {
    const libNames = configuration.outputNames;
    let target = `${currentDir}/${configurations[platform].outputRoot}/${cpu}`;
    // Check if we have any mappings here
    if (configuration.outputMapping) {
      const indexOfCpu = configuration.cpus.indexOf(cpu);
      const mappedTo = configuration.outputMapping[indexOfCpu];
      target = `${currentDir}/${configurations[platform].outputRoot}/${mappedTo}`;
    }

    if (!fs.existsSync(target)) {
      console.log(`Creating directory '${target}'...`);
      fs.mkdirSync(target + "/", { recursive: true });
    }

    libNames.forEach((libName) => {
      console.log(`Copying ${source}/${libName} to ${target}/`);
      console.log(`cp ${source}/${libName} ${target}/.`);
      executeCmdSync(`cp ${source}/${libName} ${target}/.`);
    });
  } else {
    throw new Error(
      `Could not find platform "${platform}" for tagetCpu "${cpu}" `
    );
  }
};

try {
  console.log(`Entering directory ${SkiaDir}`);
  console.log("Running gclient sync...");
  process.chdir(SkiaDir);
  // Start by running sync
  executeCmdSync("PATH=../depot_tools/:$PATH python2 tools/git-sync-deps");
  console.log("gclient sync done");
  typedKeys(configurations).forEach((platform) => {
    if (SelectedPlatform === "" || SelectedPlatform === platform) {
      const config = configurations[platform];
      config.cpus.forEach((cpu) => {
        if (SelectedCpu === "" || SelectedCpu === cpu) {
          try {
            // Configure the platform
            if (!configurePlatform(platform, cpu)) {
              throw Error(
                `Error configuring platform "${platform}" for cpu "${cpu}"`
              );
            }
            // Spawn build
            buildPlatform(platform, cpu, () => {
              process.chdir(SkiaDir);
              // Copy the output
              processOutput(platform, cpu);
              // Revert back to original directory
              process.chdir(currentDir);
            });
          } catch (err) {
            console.log(`ERROR ${platform}/${cpu}: ${err}`);
          }
        }
      });
    }
  });
  process.chdir(currentDir);
} catch (err) {
  console.log(err);
}
