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

const buildXCFrameworks = () => {
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
        `lipo -create ${OutFolder}/${os}/x64-tvsimulator/${name} ${OutFolder}/${os}/arm64-tvsimulator/${name} -output ${OutFolder}/${os}/tvsimulator/${name}`
      );
    }

    $(`mkdir -p ${OutFolder}/${os}/iphonesimulator`);
    $(`rm -rf ${OutFolder}/${os}/iphonesimulator/${name}`);
    $(
      `lipo -create ${OutFolder}/${os}/x64-iphonesimulator/${name} ${OutFolder}/${os}/arm64-iphonesimulator/${name} -output ${OutFolder}/${os}/iphonesimulator/${name}`
    );
    $(`mkdir -p ${OutFolder}/${os}/maccatalyst`);
    $(`rm -rf ${OutFolder}/${os}/maccatalyst/${name}`);
    $(
      `lipo -create ${OutFolder}/${os}/x64-maccatalyst/${name} ${OutFolder}/${os}/arm64-maccatalyst/${name} -output ${OutFolder}/${os}/maccatalyst/${name}`
    );
    $(`mkdir -p ${OutFolder}/${os}/macosx`);
    $(`rm -rf ${OutFolder}/${os}/macosx/${name}`);
    $(
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
        `-library ${prefix}/maccatalyst/${name} ` +
        ` -output ${dstPath}`
      : "xcodebuild -create-xcframework " +
        `-library ${prefix}/arm64-iphoneos/${name} ` +
        `-library ${prefix}/iphonesimulator/${name} ` +
        `-library ${prefix}/arm64-tvos/${name} ` +
        `-library ${prefix}/tvsimulator/${name} ` +
        `-library ${prefix}/macosx/${name} ` +
        `-library ${prefix}/maccatalyst/${name} ` +
        ` -output ${dstPath}`;

    $(xcframeworkCmd);
  });
};

(async () => {
  // Parse command line arguments
  const args = process.argv.slice(2);
  const defaultTargets = Object.keys(configurations);
  const targetSpecs = args.length > 0 ? args : defaultTargets;

  // Parse target specifications (platform or platform-target format)
  const buildTargets: { platform: PlatformName; targets?: string[] }[] = [];
  const validPlatforms = Object.keys(configurations);

  for (const spec of targetSpecs) {
    if (spec.includes("-")) {
      // Handle platform-target format (e.g., android-arm, android-arm64)
      const [platform, target] = spec.split("-", 2);
      if (!validPlatforms.includes(platform)) {
        console.error(`❌ Invalid platform: ${platform}`);
        console.error(`Valid platforms are: ${validPlatforms.join(", ")}`);
        exit(1);
      }

      const platformConfig = configurations[platform as PlatformName];
      if (!(target in platformConfig.targets)) {
        console.error(
          `❌ Invalid target '${target}' for platform '${platform}'`
        );
        console.error(
          `Valid targets for ${platform}: ${Object.keys(
            platformConfig.targets
          ).join(", ")}`
        );
        exit(1);
      }

      // Find existing platform entry or create new one
      let existingPlatform = buildTargets.find(
        (bt) => bt.platform === platform
      );
      if (!existingPlatform) {
        existingPlatform = { platform: platform as PlatformName, targets: [] };
        buildTargets.push(existingPlatform);
      }
      if (!existingPlatform.targets) {
        existingPlatform.targets = [];
      }
      existingPlatform.targets.push(target);
    } else {
      // Handle platform-only format (e.g., android, apple)
      if (!validPlatforms.includes(spec)) {
        console.error(`❌ Invalid platform: ${spec}`);
        console.error(`Valid platforms are: ${validPlatforms.join(", ")}`);
        exit(1);
      }
      buildTargets.push({ platform: spec as PlatformName });
    }
  }

  console.log(`🎯 Building targets: ${targetSpecs.join(", ")}`);

  if (GRAPHITE) {
    console.log("🪨 Skia Graphite");
    console.log(
      "⚠️  Apple TV (tvOS) builds are skipped when GRAPHITE is enabled"
    );
  } else {
    console.log("🐘 Skia Ganesh");
  }

  // Check Android environment variables if android is in target platforms
  const hasAndroid = buildTargets.some((bt) => bt.platform === "android");
  if (hasAndroid) {
    ["ANDROID_NDK", "ANDROID_HOME"].forEach((name) => {
      // Test for existence of Android SDK
      if (!process.env[name]) {
        console.log(`${name} not set.`);
        exit(1);
      } else {
        console.log(`✅ ${name}`);
      }
    });
  }

  // Run glient sync
  console.log("Running gclient sync...");
  // Start by running sync
  process.chdir(SkiaSrc);
  $("PATH=../depot_tools/:$PATH python3 tools/git-sync-deps");
  console.log("gclient sync done");
  $(`rm -rf ${PackageRoot}/libs`);

  // Build specified platforms and targets
  for (const buildTarget of buildTargets) {
    const { platform, targets } = buildTarget;
    const configuration = configurations[platform];
    console.log(`\n🔨 Building platform: ${platform}`);

    const targetsToProcess = targets || mapKeys(configuration.targets);

    for (const target of targetsToProcess) {
      await configurePlatform(platform, configuration, target);
      await buildPlatform(platform, target);
      process.chdir(ProjectRoot);
      if (platform === "android") {
        copyLib(
          platform,
          target,
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          configuration.targets[target].output,
          configuration.outputNames
        );
      }
    }
  }

  // Only build XCFrameworks if apple platform is included
  const hasApple = buildTargets.some((bt) => bt.platform === "apple");
  if (hasApple) {
    buildXCFrameworks();
  }

  copyHeaders();
})();
