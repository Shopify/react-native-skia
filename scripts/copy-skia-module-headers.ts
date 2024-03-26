import { executeCmdSync } from "./utils";

const copyModule = (module: string) => [
  `mkdir -p ./package/cpp/skia/modules/${module}/include`,
  `cp -a ./externals/skia/modules/${module}/include/. ./package/cpp/skia/modules/${module}/include`,
];

[
  "yarn rimraf ./package/cpp/skia/modules/",
  ...copyModule("svg"),
  ...copyModule("skresources"),
  ...copyModule("skparagraph"),
  `cp -a ./externals/skia/modules/skcms/. ./package/cpp/skia/modules/skcms`,
  `mkdir -p ./package/cpp/skia/src/`,
  `mkdir -p ./package/cpp/skia/src/core/`,
  `cp -a ./externals/skia/src/core/SkPathEnums.h ./package/cpp/skia/src/core/.`,
  `cp -a ./externals/skia/src/core/SkPathPriv.h ./package/cpp/skia/src/core/.`,
  `cp -a ./externals/skia/src/core/SkChecksum.h ./package/cpp/skia/src/core/.`,
  `cp -a ./externals/skia/src/core/SkTHash.h ./package/cpp/skia/src/core/.`,

  "mkdir -p ./package/cpp/skia/src/gpu/ganesh/gl",
  `cp -a ./externals/skia/src/gpu/ganesh/gl/GrGLDefines.h ./package/cpp/skia/src/gpu/ganesh/gl/.`,

  `cp -a ./externals/skia/src/core/SkLRUCache.h ./package/cpp/skia/src/core/.`,

  "mkdir -p ./package/cpp/skia/src/base",
  "cp -a ./externals/skia/src/base/SkTInternalLList.h ./package/cpp/skia/src/base/.",
  "cp -a ./externals/skia/src/base/SkUTF.h ./package/cpp/skia/src/base/.",

  "mkdir -p ./package/cpp/skia/modules/skunicode/include/",
  "cp -a externals/skia/modules/skunicode/include/SkUnicode.h ./package/cpp/skia/modules/skunicode/include/.",
].map((cmd) => {
  console.log(cmd);
  executeCmdSync(cmd);
});
