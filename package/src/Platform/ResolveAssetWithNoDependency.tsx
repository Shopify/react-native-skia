import { DataModule } from "../skia";
import type { resolveAsset as original } from "./ResolveAssetWithRNDependency";

export const resolveAsset: typeof original = (source: DataModule) => {
  if (typeof source === "number") {
    throw new Error(
      "Asset loading is not implemented in pure web - use React Native Web implementation"
    );
  }
  return source.default;
};
