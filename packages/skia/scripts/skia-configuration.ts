/* eslint-disable max-len */
import path from "path";

import { $ } from "./utils";

const DEBUG = false;
export const GRAPHITE = !!process.env.SK_GRAPHITE;
const BUILD_WITH_PARAGRAPH = true;

export const SkiaSrc = path.join(__dirname, "../../../externals/skia");
export const ProjectRoot = path.join(__dirname, "../../..");
export const PackageRoot = path.join(__dirname, "..");
export const OutFolder = path.join(SkiaSrc, DEBUG ? "debug" : "out");

const NdkDir = process.env.ANDROID_NDK ?? "";

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
  ["skia_use_sfntly", false],
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
];

export type PlatformName = "apple" | "android";

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

const appleMinTarget = GRAPHITE ? "15.1" : "13.0";
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
            "extra_cflags",
            `["-target", "arm64-apple-tvos", "-mappletvos-version-min=${appleMinTarget}"]`,
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
            "extra_cflags",
            `["-target", "arm64-apple-tvos-simulator", "-mappletvsimulator-version-min=${appleSimulatorMinTarget}"]`,
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
            "extra_cflags",
            `["-target", "arm64-apple-tvos-simulator", "-mappletvsimulator-version-min=${appleSimulatorMinTarget}"]`,
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
    };

export const configurations = {
  android: {
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
        '["-DSKIA_C_DLL", "-DHAVE_SYSCALL_GETRANDOM", "-DXML_DEV_URANDOM"]',
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
      "libpathops.a",
      "libjsonreader.a",
      ...ParagraphOutputsAndroid,
    ],
  },
  apple: {
    targets: {
      "arm64-iphoneos": {
        cpu: "arm64",
        platform: "ios",
        args: [["ios_min_target", `"${appleMinTarget}"`]],
      },
      "arm64-iphonesimulator": {
        cpu: "arm64",
        platform: "ios",
        args: [
          ["ios_min_target", `"${appleSimulatorMinTarget}"`],
          ["ios_use_simulator", true],
        ],
      },
      "x64-iphonesimulator": {
        cpu: "x64",
        platform: "ios",
        args: [["ios_min_target", `"${appleSimulatorMinTarget}"`]],
      },
      ...tvosTargets,
      "arm64-macosx": {
        platformGroup: "macosx",
        cpu: "arm64",
        platform: "mac",
      },
      "x64-macosx": {
        platformGroup: "macosx",
        cpu: "x64",
        platform: "mac",
      },
    },
    args: [
      ["skia_use_metal", true],
      ["cc", '"clang"'],
      ["cxx", '"clang++"'],
      ...ParagraphArgsApple,
    ],
    outputRoot: "libs/apple",
    outputNames: [
      "libskia.a",
      "libskshaper.a",
      "libsvg.a",
      "libskottie.a",
      "libsksg.a",
      "libpathops.a",
      ...ParagraphApple,
    ],
  },
};

const copyModule = (module: string) => [
  `mkdir -p ./cpp/skia/modules/${module}/include`,
  `cp -a ../../externals/skia/modules/${module}/include/. ./cpp/skia/modules/${module}/include`,
];

export const copyHeaders = () => {
  process.chdir(PackageRoot);
  [
    "rm -rf ./cpp/skia",
    "rm -rf ./cpp/dawn",

    "mkdir -p ./cpp/skia/include",
    "mkdir -p ./cpp/skia/modules",
    "mkdir -p ./cpp/skia/src",

    ...(GRAPHITE
      ? [
          "mkdir -p ./cpp/dawn/include",
          "mkdir -p ./cpp/skia/src/gpu/graphite",
          "cp -a ../../externals/skia/src/gpu/graphite/ContextOptionsPriv.h ./cpp/skia/src/gpu/graphite/.",
          "cp -a ../../externals/skia/src/gpu/graphite/ResourceTypes.h ./cpp/skia/src/gpu/graphite/.",
          "cp -a ../../externals/skia/src/gpu/graphite/TextureProxyView.h ./cpp/skia/src/gpu/graphite/.",

          "cp -a ../../externals/skia/out/android/arm/gen/third_party/externals/dawn/include/. ./cpp/dawn/include",
          "cp -a ../../externals/skia/third_party/externals/dawn/include/. ./cpp/dawn/include",
          "cp -a ../../externals/skia/third_party/externals/dawn/include/. ./cpp/dawn/include",

          // Remove duplicated WebGPU headers
          "sed -i '' 's/#include \"dawn\\/webgpu.h\"/#include \"webgpu\\/webgpu.h\"/' ./cpp/dawn/include/dawn/dawn_proc_table.h",
          "cp ./cpp/dawn/include/dawn/webgpu.h ./cpp/dawn/include/webgpu/webgpu.h",
          "cp ./cpp/dawn/include/dawn/webgpu_cpp.h ./cpp/dawn/include/webgpu/webgpu_cpp.h",
          "rm -rf ./cpp/dawn/include/dawn/webgpu.h",
          "rm -rf ./cpp/dawn/include/dawn/webgpu_cpp.h",
          "rm -rf ./cpp/dawn/include/dawn/wire",
        ]
      : []),

    "cp -a ../../externals/skia/include/. ./cpp/skia/include",
    ...copyModule("svg"),
    ...copyModule("skresources"),
    ...copyModule("skparagraph"),
    ...copyModule("skshaper"),
    ...copyModule("skottie"),
    ...copyModule("sksg"),
    ...copyModule("pathops"),

    "rm -rf ./cpp/skia/modules/jsonreader",
    "cp -a ../../externals/skia/modules/jsonreader/. ./cpp/skia/modules/jsonreader",

    "rm -rf ./cpp/skia/modules/skottie/src",
    "mkdir -p ./cpp/skia/modules/skottie/src",
    "mkdir -p ./cpp/skia/modules/skottie/src/text",
    "mkdir -p ./cpp/skia/modules/skottie/src/animator",
    "cp -a ../../externals/skia/modules/skottie/src/SkottieValue.h ./cpp/skia/modules/skottie/src/.",
    "cp -a ../../externals/skia/modules/skottie/src/text/TextAdapter.h ./cpp/skia/modules/skottie/src/text/.",
    "cp -a ../../externals/skia/modules/skottie/src/text/Font.h ./cpp/skia/modules/skottie/src/text/.",
    "cp -a ../../externals/skia/modules/skottie/src/text/TextAnimator.h ./cpp/skia/modules/skottie/src/text/.",
    "cp -a ../../externals/skia/modules/skottie/src/text/TextValue.h ./cpp/skia/modules/skottie/src/text/.",
    "cp -a ../../externals/skia/modules/skottie/src/animator/Animator.h ./cpp/skia/modules/skottie/src/animator/.",

    "cp -a ../../externals/skia/modules/skcms/. ./cpp/skia/modules/skcms",
    "mkdir -p ./cpp/skia/src/",
    "mkdir -p ./cpp/skia/src/core/",
    "cp -a ../../externals/skia/src/core/SkChecksum.h ./cpp/skia/src/core/.",
    "cp -a ../../externals/skia/src/core/SkTHash.h ./cpp/skia/src/core/.",

    // TODO: Remove this once migrated to Graphite
    "mkdir -p ./cpp/skia/src/gpu/ganesh/gl",
    "cp -a ../../externals/skia/src/gpu/ganesh/gl/GrGLDefines.h ./cpp/skia/src/gpu/ganesh/gl/.",

    "cp -a ../../externals/skia/src/core/SkLRUCache.h ./cpp/skia/src/core/.",

    "mkdir -p ./cpp/skia/src/base",
    "cp -a ../../externals/skia/src/base/SkTLazy.h ./cpp/skia/src/base/.",
    "cp -a ../../externals/skia/src/base/SkMathPriv.h ./cpp/skia/src/base/.",
    "cp -a ../../externals/skia/src/base/SkTInternalLList.h ./cpp/skia/src/base/.",
    "cp -a ../../externals/skia/src/base/SkUTF.h ./cpp/skia/src/base/.",
    "cp -a ../../externals/skia/src/base/SkArenaAlloc.h ./cpp/skia/src/base/.",

    "mkdir -p ./cpp/skia/modules/skunicode/include/",
    "cp -a ../../externals/skia/modules/skunicode/include/SkUnicode.h ./cpp/skia/modules/skunicode/include/.",

    "rm -rf ./cpp/skia/include/pathops/SkPathOps.h",
  ].map((cmd) => {
    console.log(cmd);
    $(cmd);
  });

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
};
