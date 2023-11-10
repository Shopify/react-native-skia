import {
  Image,
  PixelRatio,
  Platform as RNPlatform,
  findNodeHandle,
  View,
} from "react-native";

import type { DataModule } from "../skia/types";
import { isRNModule } from "../skia/types";

import type { IPlatform } from "./IPlatform";

export const Platform: IPlatform = {
  OS: RNPlatform.OS,
  PixelRatio: PixelRatio.get(),
  resolveAsset: (source: DataModule) => {
    return isRNModule(source)
      ? Image.resolveAssetSource(source).uri
      : source.default;
  },
  findNodeHandle,
  View,
};
