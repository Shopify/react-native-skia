import { DataModule, isRNModule } from "../skia";
import { Image } from "react-native";

export const crossPlatformAsset = {
  resolveAsset: (source: DataModule) => {
    return isRNModule(source)
      ? Image.resolveAssetSource(source).uri
      : source.default;
  },
};
