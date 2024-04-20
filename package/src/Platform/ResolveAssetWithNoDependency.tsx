// In `package/build.ts`, this file will replace `ResolveAssetWithRNDependency.tsx`
//  in order to remove React Native dependencies.

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
