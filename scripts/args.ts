const NdkDir: string = process.env.ANDROID_NDK ?? "";

export const commonArgs = [
  ["skia_use_icu", false],
  ["skia_use_piex", true],
  ["skia_use_sfntly", false],
  ["skia_use_system_expat", false],
  ["skia_use_system_libjpeg_turbo", false],
  ["skia_use_system_libpng", false],
  ["skia_use_system_libwebp", false],
  ["skia_use_system_zlib", false],
  ["skia_enable_tools", false],
  ["is_official_build", true],
  ["skia_enable_skottie", false],
  ["is_debug", false],
  ["skia_enable_pdf", false],
  ["skia_enable_flutter_defines", true],
  ["paragraph_tests_enabled", false],
  ["is_component_build", false],
];

export type PlatformName = "ios" | "android";

type Configuration = { [K in PlatformName]: Platform };
type Platform = {
  cpus: string[];
  args: (string | boolean | number)[][];
  outputRoot: string;
  outputNames: string[];
  outputMapping?: string[];
};

export const configurations: Configuration = {
  android: {
    cpus: ["arm", "arm64", "x86", "x64"],
    args: [
      ["ndk", `"${NdkDir}"`],
      ["skia_use_system_freetype2", false],
      ["skia_use_gl", true],
      [
        "extra_cflags",
        '["-DSKIA_C_DLL", "-DHAVE_SYSCALL_GETRANDOM", "-DXML_DEV_URANDOM"]',
      ],
    ],
    outputRoot: "libs/android",
    outputNames: ["libskia.a", "libskshaper.a", "libsvg.a"],
    outputMapping: ["armeabi-v7a", "arm64-v8a", "x86", "x86_64"],
  },
  ios: {
    cpus: ["arm", "arm64", "x64"],
    args: [
      ["skia_use_metal", true],
      ["skia_use_gl", true],
      ["extra_cflags", '["-DSKIA_C_DLL", "-DHAVE_ARC4RANDOM_BUF"]'],
    ],
    outputRoot: "libs/ios",
    outputNames: ["libskia.a", "libskshaper.a", "libsvg.a"],
  },
};
