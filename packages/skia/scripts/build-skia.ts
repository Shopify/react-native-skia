import { exit } from "process";

import type { Platform, PlatformName } from "./skia-configuration";
import {
  commonArgs,
  configurations,
  copyHeaders,
  GRAPHITE,
  OutFolder,
  PackageRoot,
  ProjectRoot,
  SkiaSrc,
} from "./skia-configuration";
import { $, mapKeys, runAsync } from "./utils";

const parseArgs = () => {
  const args = process.argv.slice(2);
  let platform: PlatformName | undefined;
  let arch: string | undefined;
  let buildAll = false;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--platform" && i + 1 < args.length) {
      const platformValue = args[i + 1];
      if (platformValue === "android" || platformValue === "apple") {
        platform = platformValue;
      } else {
        console.error(`Invalid platform: ${platformValue}. Must be 'android' or 'apple'.`);
        exit(1);
      }
      i++; // Skip the next argument as it's the value
    } else if (arg === "--arch" && i + 1 < args.length) {
      arch = args[i + 1];
      i++; // Skip the next argument as it's the value
    } else if (arg === "--all") {
      buildAll = true;
    }
  }

  return { platform, arch, buildAll };
};

const getOutDir = (platform: PlatformName, targetName: string) => {
  return `${OutFolder}/${platform}/${targetName}`;
};

const configurePlatform = async (
  platformName: PlatformName,
  configuration: Platform,
  targetName: string
) => {
  process.chdir(SkiaSrc);
  console.log(
    `Configuring platform "${platformName}" for target "${targetName}"`
  );
  console.log("Current directory", process.cwd());

  if (configuration) {
    const target = configuration.targets[targetName];
    if (!target) {
      console.log(
        `Target ${targetName} not found for platform ${platformName}`
      );
      exit(1);
    }

    const commandline = `PATH=../depot_tools/:$PATH gn gen ${getOutDir(
      platformName,
      targetName
    )}`;

    const args = configuration.args.reduce(
      (a, cur) => (a += `${cur[0]}=${cur[1]} \n`),
      ""
    );

    const common = commonArgs.reduce(
      (a, cur) => (a += `${cur[0]}=${cur[1]} \n`),
      ""
    );

    const targetArgs =
      target.args?.reduce((a, cur) => (a += `${cur[0]}=${cur[1]} \n`), "") ||
      "";

    const options =
      configuration.options?.reduce(
        (a, cur) => (a += `--${cur[0]}=${cur[1]} `),
        ""
      ) || "";

    const targetOptions =
      target.options?.reduce((a, cur) => (a += `--${cur[0]}=${cur[1]} `), "") ||
      "";

    // eslint-disable-next-line max-len
    const command = `${commandline} ${options} ${targetOptions} --script-executable=python3 --args='target_os="${target.platform}" target_cpu="${target.cpu}" ${common}${args}${targetArgs}'`;
    await runAsync(command, "⚙️");
    return true;
  } else {
    console.log(
      `Could not find platform "${platformName}" for target "${targetName}" `
    );
    return false;
  }
};

export const buildPlatform = async (
  platform: PlatformName,
  targetName: string
) => {
  process.chdir(SkiaSrc);
  console.log(`Building platform "${platform}" for target "${targetName}"`);
  // We need to include the path to our custom python2 -> python3 mapping script
  // to make sure we can run all scripts that uses #!/usr/bin/env python as shebang
  // https://groups.google.com/g/skia-discuss/c/BYyB-TwA8ow
  const command = `PATH=${process.cwd()}/../bin:$PATH ninja -C ${getOutDir(
    platform,
    targetName
  )}`;
  await runAsync(
    command,
    `${platform === "android" ? "🤖" : "🍏"} ${targetName}`
  );
};

export const copyLib = (
  os: PlatformName,
  cpu: string,
  platform: string,
  outputNames: string[]
) => {
  const dstPath = `${PackageRoot}/libs/${os}/${platform}/`;
  $(`mkdir -p ${dstPath}`);

  outputNames
    .map((name) => `${OutFolder}/${os}/${cpu}/${name}`)
    .forEach((lib) => {
      const libPath = lib;
      console.log(`Copying ${libPath} to ${dstPath}`);
      console.log(`cp ${libPath} ${dstPath}`);
      $(`cp ${libPath} ${dstPath}`);
    });
};

export const buildXCFrameworks = () => {
  const os: PlatformName = "apple";
  const { outputNames } = configurations.apple;
  process.chdir(SkiaSrc);
  outputNames.forEach((name) => {
    console.log("Building XCFramework for " + name);
    const prefix = `${OutFolder}/${os}`;

    // Only create tvOS frameworks if GRAPHITE is not enabled
    if (!GRAPHITE) {
      $(`mkdir -p ${OutFolder}/${os}/tvsimulator`);
      $(`rm -rf ${OutFolder}/${os}/tvsimulator/${name}`);
      $(
        // eslint-disable-next-line max-len
        `lipo -create ${OutFolder}/${os}/x64-tvsimulator/${name} ${OutFolder}/${os}/arm64-tvsimulator/${name} -output ${OutFolder}/${os}/tvsimulator/${name}`
      );
    }

    $(`mkdir -p ${OutFolder}/${os}/iphonesimulator`);
    $(`rm -rf ${OutFolder}/${os}/iphonesimulator/${name}`);
    $(
      // eslint-disable-next-line max-len
      `lipo -create ${OutFolder}/${os}/x64-iphonesimulator/${name} ${OutFolder}/${os}/arm64-iphonesimulator/${name} -output ${OutFolder}/${os}/iphonesimulator/${name}`
    );
    $(`mkdir -p ${OutFolder}/${os}/macosx`);
    $(`rm -rf ${OutFolder}/${os}/macosx/${name}`);
    $(
      // eslint-disable-next-line max-len
      `lipo -create ${OutFolder}/${os}/x64-macosx/${name} ${OutFolder}/${os}/arm64-macosx/${name} -output ${OutFolder}/${os}/macosx/${name}`
    );
    const [lib] = name.split(".");
    const dstPath = `${PackageRoot}/libs/${os}/${lib}.xcframework`;

    // Build the xcodebuild command conditionally based on GRAPHITE
    const xcframeworkCmd = GRAPHITE
      ? "xcodebuild -create-xcframework " +
        `-library ${prefix}/arm64-iphoneos/${name} ` +
        `-library ${prefix}/iphonesimulator/${name} ` +
        `-library ${prefix}/macosx/${name} ` +
        ` -output ${dstPath}`
      : "xcodebuild -create-xcframework " +
        `-library ${prefix}/arm64-iphoneos/${name} ` +
        `-library ${prefix}/iphonesimulator/${name} ` +
        `-library ${prefix}/arm64-tvos/${name} ` +
        `-library ${prefix}/tvsimulator/${name} ` +
        `-library ${prefix}/macosx/${name} ` +
        ` -output ${dstPath}`;

    $(xcframeworkCmd);
  });
};

const buildSingleTarget = async (platformName: PlatformName, targetName: string) => {
  const configuration = configurations[platformName];
  if (!configuration) {
    console.error(`Platform "${platformName}" not found in configurations`);
    exit(1);
  }

  const target = (configuration.targets as any)[targetName];
  if (!target) {
    console.error(`Target "${targetName}" not found for platform "${platformName}"`);
    console.error(`Available targets: ${Object.keys(configuration.targets).join(", ")}`);
    exit(1);
  }

  console.log(`Building ${platformName} ${targetName}`);
  
  await configurePlatform(platformName, configuration, targetName);
  await buildPlatform(platformName, targetName);
  
  process.chdir(ProjectRoot);
  if (platformName === "android") {
    copyLib(
      platformName,
      targetName,
      target.output!,
      configuration.outputNames
    );
  }
  
  copyHeaders();
};

const buildAllPlatforms = async () => {
  $(`rm -rf ${PackageRoot}/libs`);
  for (const key of mapKeys(configurations)) {
    const configuration = configurations[key];
    for (const target of mapKeys(configuration.targets)) {
      await configurePlatform(key as PlatformName, configuration, target);
      await buildPlatform(key as PlatformName, target);
      process.chdir(ProjectRoot);
      if (key === "android") {
        copyLib(
          key,
          target,
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          configuration.targets[target].output,
          configuration.outputNames
        );
      }
    }
  }
  buildXCFrameworks();
  copyHeaders();
};

(async () => {
  if (GRAPHITE) {
    console.log("🪨 Skia Graphite");
    console.log(
      "⚠️  Apple TV (tvOS) builds are skipped when GRAPHITE is enabled"
    );
  } else {
    console.log("🐘 Skia Ganesh");
  }

  const { platform, arch, buildAll } = parseArgs();

  if (platform && arch) {
    console.log(`Building single target: ${platform} ${arch}`);
    // Only check Android environment variables if building Android
    if (platform === "android") {
      ["ANDROID_NDK", "ANDROID_HOME"].forEach((name) => {
        if (!process.env[name]) {
          console.log(`${name} not set.`);
          exit(1);
        } else {
          console.log(`✅ ${name}`);
        }
      });
    }

    // Run gclient sync
    console.log("Running gclient sync...");
    process.chdir(SkiaSrc);
    $("PATH=../depot_tools/:$PATH python3 tools/git-sync-deps");
    console.log("gclient sync done");

    await buildSingleTarget(platform, arch);
  } else if (buildAll || (!platform && !arch)) {
    // Build all platforms - either explicitly with --all or implicitly (default behavior)
    console.log("Building all platforms");
    
    ["ANDROID_NDK", "ANDROID_HOME"].forEach((name) => {
      if (!process.env[name]) {
        console.log(`${name} not set.`);
        exit(1);
      } else {
        console.log(`✅ ${name}`);
      }
    });

    console.log("Running gclient sync...");
    process.chdir(SkiaSrc);
    $("PATH=../depot_tools/:$PATH python3 tools/git-sync-deps");
    console.log("gclient sync done");

    await buildAllPlatforms();
  } else {
    console.error("Both --platform and --arch must be specified together, or use --all for building all platforms");
    console.error("Usage:");
    console.error("  yarn build-skia                                    # Build all platforms (default)");
    console.error("  yarn build-skia --all                              # Build all platforms (explicit)");
    console.error("  yarn build-skia --platform <platform> --arch <arch> # Build single target");
    console.error("");
    console.error("Available architectures:");
    console.error("  Android: arm, arm64, x86, x64");
    console.error("  Apple: arm64-iphoneos, arm64-iphonesimulator, x64-iphonesimulator, arm64-macosx, x64-macosx");
    if (!GRAPHITE) {
      console.error("  Apple (tvOS): arm64-tvos, arm64-tvsimulator, x64-tvsimulator");
    }
    exit(1);
  }
})();
