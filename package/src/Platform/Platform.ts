import type { TurboModule } from "react-native";
import {
  Image,
  PixelRatio,
  Platform as RNPlatform,
  findNodeHandle,
  View,
  TurboModuleRegistry,
} from "react-native";
import codegenNativeComponent from "react-native/Libraries/Utilities/codegenNativeComponent";

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
  codegenNativeComponent,
  getTurboModule: <T extends TurboModule>(name: string) => {
    return TurboModuleRegistry.getEnforcing<T>(name);
  },
};
