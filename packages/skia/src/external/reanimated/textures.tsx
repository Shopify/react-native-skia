import { useEffect, useMemo } from "react";
import type { ReactElement } from "react";
import type { SharedValue } from "react-native-reanimated";

import type {
  DataSourceParam,
  SkImage,
  SkPicture,
  SkSize,
} from "../../skia/types";
import {
  drawAsImageFromPicture,
  drawAsPicture,
} from "../../renderer/Offscreen";
import { Skia, useImage } from "../../skia";

import Rea from "./ReanimatedProxy";

const createTexture = (
  texture: SharedValue<SkImage | null>,
  picture: SkPicture,
  size: SkSize
) => {
  "worklet";
  texture.value = drawAsImageFromPicture(picture, size);
};

export const useTexture = (element: ReactElement, size: SkSize) => {
  const { width, height } = size;
  const picture = useMemo(() => {
    return drawAsPicture(element, {
      x: 0,
      y: 0,
      width,
      height,
    });
  }, [element, width, height]);
  return usePictureAsTexture(picture, size);
};

export const useTextureAsValue = (element: ReactElement, size: SkSize) => {
  console.warn("useTextureAsValue has been renamed to use useTexture");
  return useTexture(element, size);
};

export const useTextureValueFromPicture = (
  picture: SkPicture | null,
  size: SkSize
) => {
  console.warn(
    "useTextureValueFromPicture has been renamed to use usePictureAsTexture"
  );
  return usePictureAsTexture(picture, size);
};

export const usePictureAsTexture = (
  picture: SkPicture | null,
  size: SkSize
) => {
  const texture = Rea.useSharedValue<SkImage | null>(null);
  useEffect(() => {
    if (picture !== null) {
      Rea.runOnUI(createTexture)(texture, picture, size);
    }
  }, [texture, picture, size]);
  return texture;
};

export const useImageAsTexture = (source: DataSourceParam) => {
  const texture = Rea.useSharedValue<SkImage | null>(null);
  const image = useImage(source);
  useEffect(() => {
    if (image !== null) {
      texture.value = Skia.Image.MakeTextureFromImage(image);
    }
  });
  return texture;
};
