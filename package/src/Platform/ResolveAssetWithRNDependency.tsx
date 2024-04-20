// In `package/build.ts`, this file will be replaced with
//  `ResolveAssetWithNoDependency.tsx` in order to remove React Native dependencies.

import { DataModule, isRNModule } from "../skia/types";

export const resolveAsset = (source: DataModule) => {
  if (isRNModule(source)) {
    if (typeof source === "number" && typeof require === "function") {
      const {
        getAssetByID,
      } = require("react-native/Libraries/Image/AssetRegistry");
      const { httpServerLocation, name, type } = getAssetByID(source);
      const uri = `${httpServerLocation}/${name}.${type}`;
      return uri;
    }
    throw new Error(
      "Asset source is a number - this is not supported on the web"
    );
  }
  return source.default;
};
