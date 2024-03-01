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

import { runOnUI, useSharedValue } from "./moduleWrapper";

const createTexture = (
  texture: SharedValue<SkImage | null>,
  picture: SkPicture,
  size: SkSize
) => {
  "worklet";
  texture.value = drawAsImageFromPicture(picture, size);
};

export const useTexture = (element: ReactElement, size: SkSize) => {
  const picture = useMemo(() => {
    return drawAsPicture(element);
  }, [element]);
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
  const texture = useSharedValue<SkImage | null>(null);
  useEffect(() => {
    if (picture !== null) {
      runOnUI(createTexture)(texture, picture, size);
    }
  }, [texture, picture, size]);
  return texture;
};

export const useImageAsTexture = (source: DataSourceParam) => {
  const image = useImage(source);
  const size = useMemo(() => {
    if (image) {
      return { width: image.width(), height: image.height() };
    }
    return { width: 0, height: 0 };
  }, [image]);
  const picture = useMemo(() => {
    if (image) {
      const recorder = Skia.PictureRecorder();
      const canvas = recorder.beginRecording({
        x: 0,
        y: 0,
        width: size.width,
        height: size.height,
      });
      canvas.drawImage(image, 0, 0);
      return recorder.finishRecordingAsPicture();
    } else {
      return null;
    }
  }, [size, image]);
  return usePictureAsTexture(picture, size);
};
