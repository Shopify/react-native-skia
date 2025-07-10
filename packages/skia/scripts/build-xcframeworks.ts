import { exit } from "process";

import type { PlatformName } from "./skia-configuration";
import {
  configurations,
  OutFolder,
  PackageRoot,
  SkiaSrc,
} from "./skia-configuration";

import { $ } from "./utils";

// Check for Graphite mode from environment variable
const GRAPHITE = !!process.env.SK_GRAPHITE;

const createSimulatorFatBinaries = () => {
  const os: PlatformName = "apple";
  const { outputNames } = configurations.apple;
  process.chdir(SkiaSrc);
  
  console.log("📱 Creating simulator fat binaries...");
  
  // Create output directories
  $(`mkdir -p ${OutFolder}/${os}/iphonesimulator`);
  $(`mkdir -p ${OutFolder}/${os}/macosx`);
  
  // Only create tvOS directories if not GRAPHITE
  if (!GRAPHITE) {
    $(`mkdir -p ${OutFolder}/${os}/tvsimulator`);
  }

  outputNames.forEach((name) => {
    console.log(`Creating fat binaries for ${name}`);
    
    // Create iPhone simulator fat binaries
    const iphoneSimCmd = `lipo -create ${OutFolder}/${os}/x64-iphonesimulator/${name} ${OutFolder}/${os}/arm64-iphonesimulator/${name} -output ${OutFolder}/${os}/iphonesimulator/${name}`;
    console.log(`📱 iPhone Simulator: ${iphoneSimCmd}`);
    $(iphoneSimCmd);
    
    // Create macOS fat binaries
    const macOSCmd = `lipo -create ${OutFolder}/${os}/x64-macosx/${name} ${OutFolder}/${os}/arm64-macosx/${name} -output ${OutFolder}/${os}/macosx/${name}`;
    console.log(`💻 macOS: ${macOSCmd}`);
    $(macOSCmd);
    
    // Create tvOS simulator fat binaries only if not GRAPHITE
    if (!GRAPHITE) {
      const tvSimCmd = `lipo -create ${OutFolder}/${os}/x64-tvsimulator/${name} ${OutFolder}/${os}/arm64-tvsimulator/${name} -output ${OutFolder}/${os}/tvsimulator/${name}`;
      console.log(`📺 tvOS Simulator: ${tvSimCmd}`);
      $(tvSimCmd);
    }
  });
};

const buildXCFrameworks = () => {
  const os: PlatformName = "apple";
  const { outputNames } = configurations.apple;
  process.chdir(SkiaSrc);
  
  console.log("🏗️ Building XCFrameworks...");
  
  outputNames.forEach((name) => {
    console.log("Building XCFramework for " + name);
    const prefix = `${OutFolder}/${os}`;

    const [lib] = name.split(".");
    const dstPath = `${PackageRoot}/libs/${os}/${lib}.xcframework`;

    // Remove existing XCFramework if it exists
    $(`rm -rf ${dstPath}`);

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

    console.log(`🔨 ${xcframeworkCmd}`);
    $(xcframeworkCmd);
  });
};

const checkRequiredBinaries = () => {
  const os: PlatformName = "apple";
  const { outputNames } = configurations.apple;
  const prefix = `${OutFolder}/${os}`;
  
  console.log("🔍 Checking for required Apple binaries...");
  
  const requiredTargets = [
    "arm64-iphoneos",
    "arm64-iphonesimulator", 
    "x64-iphonesimulator",
    "arm64-macosx",
    "x64-macosx"
  ];
  
  // Add tvOS targets if not GRAPHITE
  if (!GRAPHITE) {
    requiredTargets.push("arm64-tvos", "arm64-tvsimulator", "x64-tvsimulator");
  }
  
  const missingBinaries: string[] = [];
  
  for (const target of requiredTargets) {
    for (const name of outputNames) {
      const binaryPath = `${prefix}/${target}/${name}`;
      try {
        // Check if file exists and is readable
        $(`test -f ${binaryPath}`);
        console.log(`✅ Found: ${target}/${name}`);
      } catch (error) {
        console.log(`❌ Missing: ${target}/${name}`);
        missingBinaries.push(`${target}/${name}`);
      }
    }
  }
  
  if (missingBinaries.length > 0) {
    console.error(`\n❌ Missing required Apple binaries:`);
    missingBinaries.forEach(binary => console.error(`   ${binary}`));
    console.error(`\n💡 Build missing targets first:`);
    const missingTargets = [...new Set(missingBinaries.map(b => b.split('/')[0]))];
    missingTargets.forEach(target => {
      console.error(`   yarn build-skia apple-${target}`);
    });
    exit(1);
  }
  
  console.log("✅ All required Apple binaries found!");
};

(async () => {
  if (GRAPHITE) {
    console.log("🪨 Building Skia Graphite XCFrameworks");
    console.log("⚠️  Apple TV (tvOS) builds are skipped when GRAPHITE is enabled");
  } else {
    console.log("🐘 Building Skia Ganesh XCFrameworks");
  }
  
  // Check if all required binaries are present
  checkRequiredBinaries();
  
  // Create simulator fat binaries
  createSimulatorFatBinaries();
  
  // Build XCFrameworks
  buildXCFrameworks();
  
  console.log("🎉 XCFrameworks built successfully!");
  console.log(`📦 Output location: ${PackageRoot}/libs/apple/*.xcframework`);
})();