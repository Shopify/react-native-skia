import path from "path";
import { spawnSync } from "child_process";

import { $, fileOps } from "./utils";

const DEBUG = false;
export const GRAPHITE = !!process.env.SK_GRAPHITE;
export const MACCATALYST = !GRAPHITE;
const BUILD_WITH_PARAGRAPH = true;
// Re-enable mutable SkPath methods (addPath, moveTo, lineTo, etc.)
// Skia is transitioning to immutable SkPath with SkPathBuilder
// Set to false once we migrate to SkPathBuilder
const ENABLE_SKPATH_EDIT_METHODS = true;
const PATH_EDIT_FLAG = ENABLE_SKPATH_EDIT_METHODS
  ? "-USK_HIDE_PATH_EDIT_METHODS"
  : "";

export const SkiaSrc = path.join(__dirname, "../../../externals/skia");
export const ProjectRoot = path.join(__dirname, "../../..");
export const PackageRoot = path.join(__dirname, "..");
export const OutFolder = path.join(SkiaSrc, DEBUG ? "debug" : "out");

const NdkDir = process.env.ANDROID_NDK ?? "";

// Get macOS SDK root for Catalyst builds
const getAppleSdkRoot = () => {
  try {
    const result = spawnSync("xcrun", ["--sdk", "macosx", "--show-sdk-path"], {
      encoding: "utf8",
    });
    return result.stdout.trim();
  } catch (e) {
    return "/Applications/Xcode.app/Contents/Developer/Platforms/MacOSX.platform/Developer/SDKs/MacOSX.sdk";
  }
};

const appleSdkRoot = getAppleSdkRoot();

const NoParagraphArgs = [
  ["skia_use_harfbuzz", false],
  ["skia_use_icu", false],
];

// To build the paragraph API:
// On Android: we use system ICU
// On Apple: we use libgrapheme
const CommonParagraphArgs = [
  ["skia_enable_skparagraph", true],
  ["skia_use_system_icu", false],
  ["skia_use_harfbuzz", true],
  ["skia_use_system_harfbuzz", false],
];
const ParagraphArgsAndroid = BUILD_WITH_PARAGRAPH
  ? [
      ...CommonParagraphArgs,
      ["skia_use_icu", true],
      ["skia_use_runtime_icu", true],
    ]
  : NoParagraphArgs;

const ParagraphArgsApple = BUILD_WITH_PARAGRAPH
  ? [
      ...CommonParagraphArgs,
      ["skia_use_icu", false],
      ["skia_use_client_icu", false],
      ["skia_use_libgrapheme", true],
    ]
  : NoParagraphArgs;

const ParagraphApple = BUILD_WITH_PARAGRAPH
  ? ["libskparagraph.a", "libskunicode_core.a", "libskunicode_libgrapheme.a"]
  : [];

const ParagraphOutputsAndroid = BUILD_WITH_PARAGRAPH
  ? ["libskparagraph.a", "libskunicode_core.a", "libskunicode_icu.a"]
  : [];

export const commonArgs = [
  ["skia_use_piex", true],
  ["skia_use_system_expat", false],
  ["skia_use_system_libjpeg_turbo", false],
  ["skia_use_system_libpng", false],
  ["skia_use_system_libwebp", false],
  ["skia_use_system_zlib", false],
  ["skia_enable_tools", false],
  ["is_official_build", !DEBUG],
  ["skia_enable_skottie", true],
  ["is_debug", DEBUG],
  ["skia_enable_pdf", false],
  ["paragraph_tests_enabled", false],
  ["is_component_build", false],
  //["skia_enable_ganesh", !GRAPHITE],
  ["skia_enable_graphite", GRAPHITE],
  ["skia_use_dawn", GRAPHITE],
  // C++20 is required for Graphite builds (Dawn uses C++20 concepts)
  ...(GRAPHITE ? [["skia_use_cpp20", true]] : []),
];

export type PlatformName =
  | "apple-ios"
  | "apple-tvos"
  | "apple-macos"
  | "apple-maccatalyst"
  | "android";

export type ApplePlatformName = Extract<PlatformName, `apple-${string}`>;

export const isApplePlatform = (
  name: PlatformName
): name is ApplePlatformName => name.startsWith("apple-");

type Arg = (string | boolean | number)[];
export type Target = {
  args?: Arg[];
  cpu: string;
  platform?: string;
  output?: string;
  options?: Arg[];
};

export type Platform = {
  targets: { [key: string]: Target };
  args: Arg[];
  outputRoot: string;
  outputNames: string[];
  options?: Arg[];
};

const appleMinTarget = GRAPHITE ? "15.1" : "14.0";
const appleSimulatorMinTarget = "16.0";

// Define tvOS targets separately so they can be conditionally included
const tvosTargets: { [key: string]: Target } = GRAPHITE
  ? {}
  : {
      "arm64-tvos": {
        cpu: "arm64",
        platform: "tvos",
        args: [
          [
            "extra_cflags_cc",
            `["-fexceptions", "-frtti"${PATH_EDIT_FLAG ? `, "${PATH_EDIT_FLAG}"` : ""}, "-target", "arm64-apple-tvos", "-mappletvos-version-min=${appleMinTarget}"]`,
          ],
          [
            "extra_asmflags",
            `["-target", "arm64-apple-tvos", "-mappletvos-version-min=${appleMinTarget}"]`,
          ],
          [
            "extra_ldflags",
            `["-target", "arm64-apple-tvos", "-mappletvos-version-min=${appleMinTarget}"]`,
          ],
        ],
      },
      "arm64-tvsimulator": {
        cpu: "arm64",
        platform: "tvos",
        args: [
          ["ios_use_simulator", true],
          [
            "extra_cflags_cc",
            `["-fexceptions", "-frtti"${PATH_EDIT_FLAG ? `, "${PATH_EDIT_FLAG}"` : ""}, "-target", "arm64-apple-tvos-simulator", "-mappletvsimulator-version-min=${appleSimulatorMinTarget}"]`,
          ],
          [
            "extra_asmflags",
            `["-target", "arm64-apple-tvos-simulator", "-mappletvsimulator-version-min=${appleSimulatorMinTarget}"]`,
          ],
          [
            "extra_ldflags",
            `["-target", "arm64-apple-tvos-simulator", "-mappletvsimulator-version-min=${appleSimulatorMinTarget}"]`,
          ],
        ],
      },
      "x64-tvsimulator": {
        cpu: "x64",
        platform: "tvos",
        args: [
          ["ios_use_simulator", true],
          [
            "extra_cflags_cc",
            `["-fexceptions", "-frtti"${PATH_EDIT_FLAG ? `, "${PATH_EDIT_FLAG}"` : ""}, "-target", "x86_64-apple-tvos-simulator", "-mappletvsimulator-version-min=${appleSimulatorMinTarget}"]`,
          ],
          [
            "extra_asmflags",
            `["-target", "x86_64-apple-tvos-simulator", "-mappletvsimulator-version-min=${appleSimulatorMinTarget}"]`,
          ],
          [
            "extra_ldflags",
            `["-target", "x86_64-apple-tvos-simulator", "-mappletvsimulator-version-min=${appleSimulatorMinTarget}"]`,
          ],
        ],
      },
    };

// Define macCatalyst targets separately so they can be conditionally included
const maccatalystTargets: { [key: string]: Target } = MACCATALYST
  ? {
      "arm64-maccatalyst": {
        cpu: "arm64",
        platform: "mac",
        args: [
          //["skia_enable_gpu", true],
          ["target_os", `"mac"`],
          ["target_cpu", `"arm64"`],
          [
            "extra_cflags_cc",
            `["-fexceptions","-frtti"${PATH_EDIT_FLAG ? `,"${PATH_EDIT_FLAG}"` : ""},"-target","arm64-apple-ios14.0-macabi",` +
              `"-isysroot","${appleSdkRoot}",` +
              `"-isystem","${appleSdkRoot}/System/iOSSupport/usr/include",` +
              `"-iframework","${appleSdkRoot}/System/iOSSupport/System/Library/Frameworks"]`,
          ],
          [
            "extra_ldflags",
            `["-isysroot","${appleSdkRoot}",` +
              `"-iframework","${appleSdkRoot}/System/iOSSupport/System/Library/Frameworks"]`,
          ],
          ["cc", '"clang"'],
          ["cxx", '"clang++"'],
        ],
      },
      "x64-maccatalyst": {
        cpu: "x64",
        platform: "mac",
        args: [
          ["target_os", `"mac"`],
          ["target_cpu", `"x64"`],
          [
            "extra_cflags_cc",
            `["-fexceptions","-frtti"${PATH_EDIT_FLAG ? `,"${PATH_EDIT_FLAG}"` : ""},"-target","x86_64-apple-ios14.0-macabi",` +
              `"-isysroot","${appleSdkRoot}",` +
              `"-isystem","${appleSdkRoot}/System/iOSSupport/usr/include",` +
              `"-iframework","${appleSdkRoot}/System/iOSSupport/System/Library/Frameworks"]`,
          ],
          [
            "extra_ldflags",
            `["-isysroot","${appleSdkRoot}",` +
              `"-iframework","${appleSdkRoot}/System/iOSSupport/System/Library/Frameworks"]`,
          ],
          ["cc", '"clang"'],
          ["cxx", '"clang++"'],
        ],
      },
    }
  : {};

// Common Apple build arguments shared across all Apple platforms
const appleCommonArgs: Arg[] = [
  ["skia_use_metal", true],
  ["skia_use_gl", false],
  ["cc", '"clang"'],
  ["cxx", '"clang++"'],
  ...ParagraphArgsApple,
];

// Common Apple output names shared across all Apple platforms
const appleOutputNames = [
  "libskia.a",
  "libskshaper.a",
  "libsvg.a",
  "libskottie.a",
  "libsksg.a",
  ...ParagraphApple,
];

export const configurations: Record<PlatformName, Platform> = {
  "android": {
    targets: {
      arm: {
        platform: "android",
        cpu: "arm",
        output: "armeabi-v7a",
      },
      arm64: {
        platform: "android",
        cpu: "arm64",
        output: "arm64-v8a",
      },
      x86: {
        platform: "android",
        cpu: "x86",
        output: "x86",
      },
      x64: {
        platform: "android",
        cpu: "x64",
        output: "x86_64",
      },
    },
    args: [
      ...(GRAPHITE ? [["ndk_api", 26]] : []),
      ["ndk", `"${NdkDir}"`],
      ["skia_use_system_freetype2", false],
      ["skia_use_gl", !GRAPHITE],
      ["cc", '"clang"'],
      ["cxx", '"clang++"'],
      [
        "extra_cflags",
        `["-DSKIA_C_DLL", "-DHAVE_SYSCALL_GETRANDOM", "-DXML_DEV_URANDOM"${PATH_EDIT_FLAG ? `, "${PATH_EDIT_FLAG}"` : ""}]`,
      ],
      ...ParagraphArgsAndroid,
    ],
    outputRoot: "libs/android",
    outputNames: [
      "libskia.a",
      "libskshaper.a",
      "libsvg.a",
      "libskottie.a",
      "libsksg.a",
      "libjsonreader.a",
      ...ParagraphOutputsAndroid,
    ],
  },
  "apple-ios": {
    targets: {
      "arm64-iphoneos": {
        cpu: "arm64",
        platform: "ios",
        args: [
          ["ios_min_target", `"${appleMinTarget}"`],
          [
            "extra_cflags_cc",
            `["-fexceptions", "-frtti"${PATH_EDIT_FLAG ? `, "${PATH_EDIT_FLAG}"` : ""}]`,
          ],
        ],
      },
      "arm64-iphonesimulator": {
        cpu: "arm64",
        platform: "ios",
        args: [
          ["ios_min_target", `"${appleSimulatorMinTarget}"`],
          ["ios_use_simulator", true],
          [
            "extra_cflags_cc",
            `["-fexceptions", "-frtti"${PATH_EDIT_FLAG ? `, "${PATH_EDIT_FLAG}"` : ""}]`,
          ],
        ],
      },
      "x64-iphonesimulator": {
        cpu: "x64",
        platform: "ios",
        args: [
          ["ios_min_target", `"${appleSimulatorMinTarget}"`],
          [
            "extra_cflags_cc",
            `["-fexceptions", "-frtti"${PATH_EDIT_FLAG ? `, "${PATH_EDIT_FLAG}"` : ""}]`,
          ],
        ],
      },
    },
    args: appleCommonArgs,
    outputRoot: "libs/apple/ios",
    outputNames: appleOutputNames,
  },
  "apple-tvos": GRAPHITE
    ? {
        targets: {},
        args: [],
        outputRoot: "libs/apple/tvos",
        outputNames: [],
      }
    : {
        targets: tvosTargets,
        args: appleCommonArgs,
        outputRoot: "libs/apple/tvos",
        outputNames: appleOutputNames,
      },
  "apple-macos": {
    targets: {
      "arm64-macosx": {
        cpu: "arm64",
        platform: "mac",
        args: [
          [
            "extra_cflags_cc",
            `["-fexceptions", "-frtti"${PATH_EDIT_FLAG ? `, "${PATH_EDIT_FLAG}"` : ""}]`,
          ],
        ],
      },
      "x64-macosx": {
        cpu: "x64",
        platform: "mac",
        args: [
          [
            "extra_cflags_cc",
            `["-fexceptions", "-frtti"${PATH_EDIT_FLAG ? `, "${PATH_EDIT_FLAG}"` : ""}]`,
          ],
        ],
      },
    },
    args: appleCommonArgs,
    outputRoot: "libs/apple/macos",
    outputNames: appleOutputNames,
  },
  "apple-maccatalyst": MACCATALYST
    ? {
        targets: maccatalystTargets,
        args: appleCommonArgs,
        outputRoot: "libs/apple/maccatalyst",
        outputNames: appleOutputNames,
      }
    : {
        targets: {},
        args: [],
        outputRoot: "libs/apple/maccatalyst",
        outputNames: [],
      },
};

const copyModule = (module: string) => {
  const destDir = `./cpp/skia/modules/${module}/include`;
  const srcDir = `../../externals/skia/modules/${module}/include`;
  fileOps.mkdir(destDir);
  fileOps.cp(srcDir, destDir);
};

const getFirstAvailableTarget = () => {
  // Use the same logic as build-skia.ts to get the first available target
  const platforms = Object.keys(configurations) as PlatformName[];

  for (const platformName of platforms) {
    const configuration = configurations[platformName];
    const targetNames = Object.keys(configuration.targets);

    for (const targetName of targetNames) {
      const targetPath = `${platformName}/${targetName}`;
      const dawnPath = `../../externals/skia/out/${targetPath}/gen/third_party/externals/dawn`;

      try {
        require("fs").statSync(dawnPath);
        return targetPath;
      } catch (e) {
        // Dawn folder doesn't exist for this target, try next
        continue;
      }
    }
  }

  // No target found with dawn folder
  throw new Error(
    "No target found with dawn folder at ../../externals/skia/out/{target}/gen/third_party/externals/dawn"
  );
};

export const copyHeaders = () => {
  // Check if this is a local build (build output exists) vs prebuilt download
  const fs = require("fs");
  let hasLocalBuild = false;
  try {
    const targetPath = getFirstAvailableTarget();
    const dawnIncludeSrc = `../../externals/skia/out/${targetPath}/gen/third_party/externals/dawn/include`;
    console.log(`   Looking for local build at: ${dawnIncludeSrc}`);
    hasLocalBuild = fs.existsSync(dawnIncludeSrc);
  } catch (e) {
    // No local build found
    hasLocalBuild = false;
  }
  console.log("⚙️ Copying Skia headers...");
  process.chdir(PackageRoot);

  console.log("   Cleaning up existing directories...");
  if (hasLocalBuild) {
    // Clean up existing directories
    fileOps.rm("./cpp/skia");
    fileOps.rm("./cpp/dawn");
  }

  console.log("   Creating base directories...");
  // Create base directories
  fileOps.mkdir("./cpp/skia/include");
  fileOps.mkdir("./cpp/skia/modules");
  fileOps.mkdir("./cpp/skia/src");

  // Graphite-specific setup - only copy from local build if it exists
  if (GRAPHITE) {
    console.log("   Checking for Graphite build source...");

    if (hasLocalBuild) {
      console.log("   📦 Copying Graphite headers from local build...");
      fileOps.mkdir("./cpp/dawn/include");
      fileOps.mkdir("./cpp/skia/src/gpu/graphite");

      console.log("      - Copying Graphite source headers...");
      fileOps.cp(
        "../../externals/skia/src/gpu/graphite/ContextOptionsPriv.h",
        "./cpp/skia/src/gpu/graphite/ContextOptionsPriv.h"
      );
      fileOps.cp(
        "../../externals/skia/src/gpu/graphite/ResourceTypes.h",
        "./cpp/skia/src/gpu/graphite/ResourceTypes.h"
      );
      fileOps.cp(
        "../../externals/skia/src/gpu/graphite/TextureProxyView.h",
        "./cpp/skia/src/gpu/graphite/TextureProxyView.h"
      );

      console.log("      - Copying Dawn headers...");
      const dawnIncludeSrc = `../../externals/skia/out/${getFirstAvailableTarget()}/gen/third_party/externals/dawn/include`;
      fileOps.cp(dawnIncludeSrc, "./cpp/dawn/include");
      fileOps.cp(
        "../../externals/skia/third_party/externals/dawn/include",
        "./cpp/dawn/include"
      );

      console.log("      - Fixing WebGPU header references...");
      // Fix WebGPU header references
      fileOps.sed(
        "./cpp/dawn/include/dawn/dawn_proc_table.h",
        /#include "dawn\/webgpu\.h"/g,
        '#include "webgpu/webgpu.h"'
      );
      fileOps.mkdir("./cpp/dawn/include/webgpu");
      fileOps.cp(
        "./cpp/dawn/include/dawn/webgpu.h",
        "./cpp/dawn/include/webgpu/webgpu.h"
      );
      fileOps.cp(
        "./cpp/dawn/include/dawn/webgpu_cpp.h",
        "./cpp/dawn/include/webgpu/webgpu_cpp.h"
      );
      fileOps.rm("./cpp/dawn/include/dawn/webgpu.h");
      fileOps.rm("./cpp/dawn/include/dawn/webgpu_cpp.h");
      fileOps.rm("./cpp/dawn/include/dawn/wire");
      fileOps.rm("./cpp/dawn/include/webgpu/webgpu_cpp_print.h");
      console.log("      ✓ Graphite headers copied from local build");
    } else {
      console.log(
        "   ✓ Skipping Graphite headers copy (using prebuilt headers from download)"
      );
    }
  }

  console.log("   Copying main include directory...");
  // Copy main include directory
  fileOps.cp("../../externals/skia/include", "./cpp/skia/include");

  console.log("   Copying Skia modules...");
  // Copy modules
  copyModule("svg");
  copyModule("skresources");
  copyModule("skparagraph");
  copyModule("skshaper");
  copyModule("skottie");
  copyModule("sksg");

  console.log("   Copying jsonreader module...");
  // Copy jsonreader module
  fileOps.rm("./cpp/skia/modules/jsonreader");
  fileOps.cp(
    "../../externals/skia/modules/jsonreader",
    "./cpp/skia/modules/jsonreader"
  );

  console.log("   Copying skottie source files...");
  // Copy skottie src files
  fileOps.rm("./cpp/skia/modules/skottie/src");
  fileOps.mkdir("./cpp/skia/modules/skottie/src");
  fileOps.mkdir("./cpp/skia/modules/skottie/src/text");
  fileOps.mkdir("./cpp/skia/modules/skottie/src/animator");
  fileOps.cp(
    "../../externals/skia/modules/skottie/src/SkottieValue.h",
    "./cpp/skia/modules/skottie/src/SkottieValue.h"
  );
  fileOps.cp(
    "../../externals/skia/modules/skottie/src/text/TextAdapter.h",
    "./cpp/skia/modules/skottie/src/text/TextAdapter.h"
  );
  fileOps.cp(
    "../../externals/skia/modules/skottie/src/text/Font.h",
    "./cpp/skia/modules/skottie/src/text/Font.h"
  );
  fileOps.cp(
    "../../externals/skia/modules/skottie/src/text/TextAnimator.h",
    "./cpp/skia/modules/skottie/src/text/TextAnimator.h"
  );
  fileOps.cp(
    "../../externals/skia/modules/skottie/src/text/TextValue.h",
    "./cpp/skia/modules/skottie/src/text/TextValue.h"
  );
  fileOps.cp(
    "../../externals/skia/modules/skottie/src/animator/Animator.h",
    "./cpp/skia/modules/skottie/src/animator/Animator.h"
  );

  console.log("   Copying skcms module...");
  // Copy skcms module
  fileOps.cp("../../externals/skia/modules/skcms", "./cpp/skia/modules/skcms");

  console.log("   Copying src/core files...");
  // Copy src/core files
  fileOps.mkdir("./cpp/skia/src/");
  fileOps.mkdir("./cpp/skia/src/core/");
  fileOps.cp(
    "../../externals/skia/src/core/SkChecksum.h",
    "./cpp/skia/src/core/SkChecksum.h"
  );
  fileOps.cp(
    "../../externals/skia/src/core/SkTHash.h",
    "./cpp/skia/src/core/SkTHash.h"
  );

  console.log("   Copying Ganesh GPU files...");
  // TODO: Remove this once migrated to Graphite
  fileOps.mkdir("./cpp/skia/src/gpu/ganesh/gl");
  fileOps.cp(
    "../../externals/skia/src/gpu/ganesh/gl/GrGLDefines.h",
    "./cpp/skia/src/gpu/ganesh/gl/GrGLDefines.h"
  );

  fileOps.cp(
    "../../externals/skia/src/core/SkLRUCache.h",
    "./cpp/skia/src/core/SkLRUCache.h"
  );

  console.log("✅ Skia headers copied successfully");

  // Copy src/base files
  fileOps.mkdir("./cpp/skia/src/base");
  fileOps.cp(
    "../../externals/skia/src/base/SkTLazy.h",
    "./cpp/skia/src/base/SkTLazy.h"
  );
  fileOps.cp(
    "../../externals/skia/src/base/SkMathPriv.h",
    "./cpp/skia/src/base/SkMathPriv.h"
  );
  fileOps.cp(
    "../../externals/skia/src/base/SkTInternalLList.h",
    "./cpp/skia/src/base/SkTInternalLList.h"
  );
  fileOps.cp(
    "../../externals/skia/src/base/SkUTF.h",
    "./cpp/skia/src/base/SkUTF.h"
  );
  fileOps.cp(
    "../../externals/skia/src/base/SkArenaAlloc.h",
    "./cpp/skia/src/base/SkArenaAlloc.h"
  );

  // Copy skunicode
  fileOps.mkdir("./cpp/skia/modules/skunicode/include/");
  fileOps.cp(
    "../../externals/skia/modules/skunicode/include/SkUnicode.h",
    "./cpp/skia/modules/skunicode/include/SkUnicode.h"
  );
  // Check for duplicate header names and issue warnings
  const duplicateHeaders = $(
    "find ./cpp -name '*.h' -type f | sed 's/.*\\///' | sort | uniq -d"
  ).toString();
  if (duplicateHeaders.trim()) {
    console.warn("⚠️  WARNING: Found duplicate header names:");
    let hasNonGraphiteDuplicates = false;

    duplicateHeaders
      .split("\n")
      .filter(Boolean)
      .forEach((filename: string) => {
        const fullPaths = $(
          `find ./cpp -name "${filename}" -type f`
        ).toString();
        const paths = fullPaths.split("\n").filter(Boolean);

        // Check if any of the paths contain 'graphite'
        const hasGraphitePath = paths.some((filePath: string) =>
          filePath.includes("graphite")
        );

        console.warn(`   ${filename}:`);
        paths.forEach((filePath: string) => {
          console.warn(`     ${filePath}`);
        });

        // If it's a Graphite-related duplicate and GRAPHITE is false, don't count it as an error
        if (!hasGraphitePath || GRAPHITE) {
          hasNonGraphiteDuplicates = true;
        } else {
          console.warn(
            `     (Graphite-related duplicate - ignoring since GRAPHITE=${GRAPHITE})`
          );
        }
      });

    if (hasNonGraphiteDuplicates) {
      console.error(
        "❌ ERROR: Duplicate headers found that will cause iOS build conflicts!"
      );
      process.exit(1);
    }
  }
  console.log("✅ Skia headers copied to ./cpp/skia");
};
