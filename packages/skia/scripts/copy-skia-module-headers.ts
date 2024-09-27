import { executeCmdSync } from "./utils";

const copyModule = (module: string) => [
  `mkdir -p ./cpp/skia/modules/${module}/include`,
  `cp -a ../../externals/skia/modules/${module}/include/. ./cpp/skia/modules/${module}/include`,
];

[
  "yarn rimraf ./cpp/skia/modules/",
  ...copyModule("svg"),
  ...copyModule("skresources"),
  ...copyModule("skparagraph"),
  ...copyModule("skshaper"),
  "cp -a ../../externals/skia/modules/skcms/. ./cpp/skia/modules/skcms",
  "mkdir -p ./cpp/skia/src/",
  "mkdir -p ./cpp/skia/src/core/",
  "cp -a ../../externals/skia/src/core/SkChecksum.h ./cpp/skia/src/core/.",
  "cp -a ../../externals/skia/src/core/SkTHash.h ./cpp/skia/src/core/.",

  "mkdir -p ./cpp/skia/src/gpu/ganesh/gl",
  "cp -a ../../externals/skia/src/gpu/ganesh/gl/GrGLDefines.h ./cpp/skia/src/gpu/ganesh/gl/.",

  "cp -a ../../externals/skia/src/core/SkLRUCache.h ./cpp/skia/src/core/.",

  "mkdir -p ./cpp/skia/src/base",
  "cp -a ../../externals/skia/src/base/SkTLazy.h ./cpp/skia/src/base/.",
  "cp -a ../../externals/skia/src/base/SkMathPriv.h ./cpp/skia/src/base/.",
  "cp -a ../../externals/skia/src/base/SkTInternalLList.h ./cpp/skia/src/base/.",
  "cp -a ../../externals/skia/src/base/SkUTF.h ./cpp/skia/src/base/.",
].map((cmd) => {
  console.log(cmd);
  executeCmdSync(cmd);
});
