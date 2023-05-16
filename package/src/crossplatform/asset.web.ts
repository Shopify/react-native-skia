import { DataModule, isRNModule } from "../skia";
import type { crossPlatformAsset as original } from "./asset";

export const crossPlatformAsset: typeof original = {
  resolveAsset: (source: DataModule) => {
    if (isRNModule(source)) {
      throw new Error(
        "Image source is a number - this is not supported on the web"
      );
    }

    return source.default;
  },
};
