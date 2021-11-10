/*global SkiaApi*/
import type { ImageSourcePropType } from "react-native";

import type { TileMode } from "./ImageFilter";
import type { IShader } from "./Shader";
import type { IMatrix } from "./Matrix";

const resolveAssetSource = require("react-native/Libraries/Image/resolveAssetSource");
export interface IImage {
  readonly width: number;
  readonly height: number;
  readonly uri: string;
  makeShader(tileModeX: TileMode, tileModeY: TileMode, m?: IMatrix): IShader;
}

export const ImageCtor = (image: ImageSourcePropType) => {
  const asset = resolveAssetSource(image);
  return SkiaApi.Image(asset.uri);
};
