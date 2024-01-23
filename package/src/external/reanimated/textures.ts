import type { ReactElement } from "react";
import { useEffect, useMemo } from "react";
import type { SharedValue } from "react-native-reanimated";

import { Skia } from "../../skia";
import type { SkImage, SkPicture, SkSize } from "../../skia/types";
import { drawAsPicture } from "../../renderer/Offscreen";

import { runOnUI, useSharedValue } from "./moduleWrapper";

const createTexture = (
  texture: SharedValue<SkImage | null>,
  picture: SkPicture,
  size: SkSize
) => {
  "worklet";
  const surface = Skia.Surface.MakeOffscreen(size.width, size.height)!;
  const canvas = surface.getCanvas();
  canvas.drawPicture(picture);
  surface.flush();
  texture.value = surface.makeImageSnapshot();
};

export const useTextureValue = (element: ReactElement, size: SkSize) => {
  const picture = useMemo(() => {
    return drawAsPicture(element);
  }, [element]);
  const texture = useSharedValue<SkImage | null>(null);
  useEffect(() => {
    runOnUI(createTexture)(texture, picture, size);
  }, [texture, picture, size]);
  return texture;
};
