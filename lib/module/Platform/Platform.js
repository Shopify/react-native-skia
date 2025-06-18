import { Image, PixelRatio, Platform as RNPlatform, findNodeHandle, View } from "react-native";
import { isRNModule } from "../skia/types";
export const Platform = {
  OS: RNPlatform.OS,
  PixelRatio: PixelRatio.get(),
  resolveAsset: source => {
    return isRNModule(source) ? Image.resolveAssetSource(source).uri : source.default;
  },
  findNodeHandle,
  View
};
//# sourceMappingURL=Platform.js.map