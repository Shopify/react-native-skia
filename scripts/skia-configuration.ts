import { executeCmdSync } from "./utils";

const NdkDir: string = process.env.ANDROID_NDK ?? "";

// To build with the paragraph API's, you need to set this to true, and
// you need to update the following files with some uncommenting:
// 1) CMakeLists.txt
// 2) react-native-skia.podspec
// 3) package.json - add the following files to the files array:
//    "libs/ios/libskparagraph.xcframework",
//    "libs/ios/libskunicode.xcframework",
// 4) build-skia.yml:
//    Line 60:
//      ${{ env.WORKING_DIRECTORY }}/externals/skia/out/android/arm/libskparagraph.a
//      ${{ env.WORKING_DIRECTORY }}/externals/skia/out/android/arm/libskunicode.a
//    Line 72:
//      ${{ env.WORKING_DIRECTORY }}/externals/skia/out/android/arm64/libskparagraph.a
//      ${{ env.WORKING_DIRECTORY }}/externals/skia/out/android/arm64/libskunicode.a
//    Line 84:
//      ${{ env.WORKING_DIRECTORY }}/externals/skia/out/android/x86/libskparagraph.a
//      ${{ env.WORKING_DIRECTORY }}/externals/skia/out/android/x86/libskunicode.a
//   Line 96:
//      ${{ env.WORKING_DIRECTORY }}/externals/skia/out/android/x64/libskparagraph.a
//      ${{ env.WORKING_DIRECTORY }}/externals/skia/out/android/x64/libskunicode.a
//   Line 108:
//      ${{ env.WORKING_DIRECTORY }}/package/libs/ios/libskparagraph.xcframework
//      ${{ env.WORKING_DIRECTORY }}/package/libs/ios/libskunicode.xcframework
// 5) build-npm-package.ts:
//    Line 47-48, uncomment
//    Line 66-67, uncomment
// 6) Workflow-copy-libs.ts:
//    27-28 and 36-37, uncomment
export const BUILD_WITH_PARAGRAPH = false;
const ParagraphArgs = BUILD_WITH_PARAGRAPH
  ? [
      ["skia_enable_paragraph", true],
      ["skia_use_icu", true],
      ["skia_use_system_icu", false],
      ["skia_use_harfbuzz", true],
      ["skia_use_system_harfbuzz", false],
    ]
  : [
      ["skia_use_harfbuzz", false],
      ["skia_use_icu", false],
    ];

const ParagraphOutputs = BUILD_WITH_PARAGRAPH
  ? ["libskparagraph.a", "libskunicode.a"]
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
  ["is_official_build", true],
  ["skia_enable_skottie", true],
  ["is_debug", false],
  ["skia_enable_pdf", false],
  ["skia_enable_flutter_defines", true],
  ["paragraph_tests_enabled", false],
  ["is_component_build", false],
  ...ParagraphArgs,
];

export type PlatformName = "ios" | "android";

type Arg = (string | boolean | number)[];
export type Target = {
  args?: Arg[];
  cpu: string;
  output?: string;
  options?: Arg[];
};
export type Configuration = { [K in PlatformName]: Platform };
export type Platform = {
  targets: { [key: string]: Target };
  args: Arg[];
  outputRoot: string;
  outputNames: string[];
  options?: Arg[];
};

export const configurations: Configuration = {
  android: {
    targets: {
      arm: {
        cpu: "arm",
        output: "armeabi-v7a",
      },
      arm64: {
        cpu: "arm64",
        output: "arm64-v8a",
      },
      x86: {
        cpu: "x86",
        output: "x86",
      },
      x64: {
        cpu: "x64",
        output: "x86_64",
      },
    },
    args: [
      ["ndk_api", 26],
      ["ndk", `"${NdkDir}"`],
      ["skia_use_system_freetype2", false],
      ["skia_use_runtime_icu", true],
      ["skia_use_gl", true],
      ["cc", '"clang"'],
      ["cxx", '"clang++"'],
      [
        "extra_cflags",
        '["-DSKIA_C_DLL", "-DHAVE_SYSCALL_GETRANDOM", "-DXML_DEV_URANDOM"]',
      ],
    ],
    outputRoot: "package/libs/android",
    outputNames: [
      "libskia.a",
      "libskshaper.a",
      "libsvg.a",
      "libskottie.a",
      "libsksg.a",
      ...ParagraphOutputs,
    ],
  },
  ios: {
    targets: {
      "arm64-iphoneos": {
        cpu: "arm64",
        args: [
          ["ios_min_target", '"13.0"'],
          ["extra_cflags", '["-target", "arm64-apple-ios"]'],
          ["extra_asmflags", '["-target", "arm64-apple-ios"]'],
          ["extra_ldflags", '["-target", "arm64-apple-ios"]'],
        ],
      },
      "arm64-iphonesimulator": {
        cpu: "arm64",
        args: [
          ["ios_min_target", '"13.0"'],
          ["extra_cflags", '["-target", "arm64-apple-ios-simulator"]'],
          ["extra_asmflags", '["-target", "arm64-apple-ios-simulator"]'],
          ["extra_ldflags", '["-target", "arm64-apple-ios-simulator"]'],
        ],
      },
      x64: {
        cpu: "x64",
        args: [
          ["ios_min_target", '"13.0"'],
          ["extra_cflags", '["-target", "arm64-apple-ios-simulator"]'],
          ["extra_asmflags", '["-target", "arm64-apple-ios-simulator"]'],
          ["extra_ldflags", '["-target", "arm64-apple-ios-simulator"]'],
        ],
      },
    },
    args: [
      ["skia_use_metal", true],
      ["cc", '"clang"'],
      ["cxx", '"clang++"'],
    ],
    outputRoot: "package/libs/ios",
    outputNames: [
      "libskia.a",
      "libskshaper.a",
      "libsvg.a",
      "libskottie.a",
      "libsksg.a",
      ...ParagraphOutputs,
    ],
  },
};
