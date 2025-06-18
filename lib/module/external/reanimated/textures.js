import { useEffect, useMemo } from "react";
import { drawAsImageFromPicture, drawAsPicture } from "../../renderer/Offscreen";
import { Skia, useImage } from "../../skia";
import Rea from "./ReanimatedProxy";
const createTexture = (texture, picture, size) => {
  "worklet";

  texture.value = drawAsImageFromPicture(picture, size);
};
export const useTexture = (element, size) => {
  const {
    width,
    height
  } = size;
  const picture = useMemo(() => {
    return drawAsPicture(element, {
      x: 0,
      y: 0,
      width,
      height
    });
  }, [element, width, height]);
  return usePictureAsTexture(picture, size);
};
export const useTextureAsValue = (element, size) => {
  console.warn("useTextureAsValue has been renamed to use useTexture");
  return useTexture(element, size);
};
export const useTextureValueFromPicture = (picture, size) => {
  console.warn("useTextureValueFromPicture has been renamed to use usePictureAsTexture");
  return usePictureAsTexture(picture, size);
};
export const usePictureAsTexture = (picture, size) => {
  const texture = Rea.useSharedValue(null);
  useEffect(() => {
    if (picture !== null) {
      Rea.runOnUI(createTexture)(texture, picture, size);
    }
  }, [texture, picture, size]);
  return texture;
};
export const useImageAsTexture = source => {
  const image = useImage(source);
  const size = useMemo(() => {
    if (image) {
      return {
        width: image.width(),
        height: image.height()
      };
    }
    return {
      width: 0,
      height: 0
    };
  }, [image]);
  const picture = useMemo(() => {
    if (image) {
      const recorder = Skia.PictureRecorder();
      const canvas = recorder.beginRecording({
        x: 0,
        y: 0,
        width: size.width,
        height: size.height
      });
      canvas.drawImage(image, 0, 0);
      return recorder.finishRecordingAsPicture();
    } else {
      return null;
    }
  }, [size, image]);
  return usePictureAsTexture(picture, size);
};
//# sourceMappingURL=textures.js.map