import { executeCmdSync } from "./utils";

const copyModule = (module: string) => [
  `mkdir -p ./cpp/skia/modules/${module}/include`,
  `cp -a ../../externals/skia/modules/${module}/include/. ./cpp/skia/modules/${module}/include`,
];

[
  "rm -rf ./cpp/skia",

  "mkdir -p ./cpp/skia",
  "mkdir -p ./cpp/skia/include",
  "mkdir -p ./cpp/skia/modules",
  "mkdir -p ./cpp/skia/src",

  "cp -a ../../externals/skia/include/. ./cpp/skia/include",
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

  "mkdir -p ./cpp/skia/modules/skunicode/include/",
  "cp -a ../../externals/skia/modules/skunicode/include/SkUnicode.h ./cpp/skia/modules/skunicode/include/.",

  // Remove migrated headers
  //grep -R "Delete this after migrating clients" cpp
  "rm -rf ./cpp/skia/include/gpu/GrContextThreadSafeProxy.h",
  "rm -rf ./cpp/skia/include/gpu/GrDirectContext.h",
  "rm -rf ./cpp/skia/include/gpu/GrBackendSemaphore.h",
  "rm -rf ./cpp/skia/include/gpu/mock/GrMockTypes.h",
  "rm -rf ./cpp/skia/include/gpu/GrDriverBugWorkaroundsAutogen.h",
  "rm -rf ./cpp/skia/include/gpu/GrTypes.h",
  "rm -rf ./cpp/skia/include/gpu/vk/GrVkTypes.h",
  "rm -rf ./cpp/skia/include/gpu/GrDriverBugWorkarounds.h",
  "rm -rf ./cpp/skia/include/gpu/GrContextOptions.h",
  "rm -rf ./cpp/skia/include/gpu/gl/GrGLExtensions.h",
  "rm -rf ./cpp/skia/include/gpu/gl/GrGLAssembleInterface.h",
  "rm -rf ./cpp/skia/include/gpu/gl/GrGLTypes.h",
  "rm -rf ./cpp/skia/include/gpu/gl/GrGLConfig.h",
  "rm -rf ./cpp/skia/include/gpu/gl/GrGLFunctions.h",
  "rm -rf ./cpp/skia/include/gpu/gl/GrGLAssembleHelpers.h",
  "rm -rf ./cpp/skia/include/gpu/gl/GrGLInterface.h",
  "rm -rf ./cpp/skia/include/gpu/GrYUVABackendTextures.h",
  "rm -rf ./cpp/skia/include/gpu/GrRecordingContext.h",
  "rm -rf ./cpp/skia/include/gpu/GrBackendSurface.h",
  "rm -rf ./cpp/skia/include/gpu/d3d/GrD3DBackendContext.h",
  "rm -rf ./cpp/skia/include/gpu/d3d/GrD3DTypes.h",
].map((cmd) => {
  console.log(cmd);
  executeCmdSync(cmd);
});
