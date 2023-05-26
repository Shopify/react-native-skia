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
  `cp -a ./externals/skia/src/core/SkTHash.h ./package/cpp/skia/src/core/.`,
].map((cmd) => {
  console.log(cmd);
  executeCmdSync(cmd);
});
