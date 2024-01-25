import { useEffect, useMemo } from "react";
import type { ReactElement } from "react";
import type { SharedValue } from "react-native-reanimated";

import type { SkImage, SkPicture, SkSize } from "../../skia/types";
import {
  createTextureFromPicture,
  drawAsPicture,
} from "../../renderer/Offscreen";

import { runOnUI, useSharedValue } from "./moduleWrapper";

const createTextureValue = (
  texture: SharedValue<SkImage | null>,
  picture: SkPicture,
  size: SkSize
) => {
  "worklet";
  texture.value = createTextureFromPicture(picture, size);
};

export const useTextureValue = (element: ReactElement, size: SkSize) => {
  const picture = useMemo(() => {
    return drawAsPicture(element);
  }, [element]);
  return useTextureValueFromPicture(picture, size);
};

export const useTextureValueFromPicture = (
  picture: SkPicture,
  size: SkSize
) => {
  const texture = useSharedValue<SkImage | null>(null);
  useEffect(() => {
    runOnUI(createTextureValue)(texture, picture, size);
  }, [texture, picture, size]);
  return texture;
};
