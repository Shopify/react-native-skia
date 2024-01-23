import { useEffect, useMemo } from "react";
import type { ReactElement } from "react";
import type { SharedValue } from "react-native-reanimated";

import { Skia } from "../../skia";
import type { SkImage, SkPicture, SkSize } from "../../skia/types";
import { drawAsPicture } from "../../renderer/Offscreen";

import { runOnUI, useSharedValue } from "./moduleWrapper";

// TODO: Warning: here we don't need to scale to the pixel density even thought we are drawing offscreen
// because of the way makeImageSnapshot() currently works (it redraws and scale the canvas to the pixel density).
// This is quite a dangerous behaviour that we probably want to sanitize.
// A first step would be to differentiate the implementation of makeImageSnapshot between onscreen and offscreen views
const pd = 1; //Platform.PixelRatio;

const createTexture = (
  texture: SharedValue<SkImage | null>,
  picture: SkPicture,
  size: SkSize
) => {
  "worklet";
  const surface = Skia.Surface.MakeOffscreen(
    size.width * pd,
    size.height * pd
  )!;
  const canvas = surface.getCanvas();
  // see comment above
  //canvas.save();
  //canvas.scale(pd, pd);
  canvas.drawPicture(picture);
  //canvas.restore();
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
