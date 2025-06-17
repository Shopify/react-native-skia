import { useEffect, useMemo, useState } from "react";
import type { DependencyList, ReactElement } from "react";
import type { SharedValue } from "react-native-reanimated";

import type {
  DataSourceParam,
  SkImage,
  SkPicture,
  SkSize,
  SkSurface,
} from "../../skia/types";
import {
  drawAsImageFromPicture,
  drawAsPicture,
} from "../../renderer/Offscreen";
import { Skia, useImage } from "../../skia";

import Rea from "./ReanimatedProxy";

const createTexture2 = (
  surface: SkSurface,
  image: SkImage,
  picture: SkPicture,
  size: SkSize
) => {
  "worklet";
  const canvas = surface.getCanvas();
  canvas.drawPicture(picture);
  surface.flush();
  Skia.Image.MakeImageFromNativeTextureUnstable(
    surface.getNativeTextureUnstable(),
    size.width,
    size.height,
    false,
    image
  );
};

const createTexture = (
  texture: SharedValue<SkImage | null>,
  picture: SkPicture,
  size: SkSize
) => {
  "worklet";
  texture.value = drawAsImageFromPicture(picture, size);
};

export const useTexture = (
  element: ReactElement,
  size: SkSize,
  deps?: DependencyList
) => {
  const { width, height } = size;
  const [picture, setPicture] = useState<SkPicture | null>(null);
  useEffect(() => {
    drawAsPicture(element, {
      x: 0,
      y: 0,
      width,
      height,
    }).then((pic) => {
      setPicture(pic);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps ?? []);
  return usePictureAsTexture(picture, size);
};

export const usePictureAsTexture = (
  picture: SkPicture | null,
  size: SkSize
) => {
  const image = Rea.useSharedValue<SkImage | null>(Skia.Image.MakeNull());
  const surface = Rea.useSharedValue<SkSurface | null>(null);
  useEffect(() => {
    if (size.width > 0 && size.height > 0) {
      surface.value = Skia.Surface.MakeOffscreen(size.width, size.height)!;
    } else {
      surface.value = null;
    }
  }, [size, surface]);
  useEffect(() => {
    if (picture !== null && surface.value !== null) {
      Rea.runOnUI(createTexture2)(surface.value, image.value, picture, size);
    }
  }, [image, picture, size, surface]);
  return image;
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
