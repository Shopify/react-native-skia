import type { SkSize, SkSurface } from "@shopify/react-native-skia";
import { Skia } from "@shopify/react-native-skia";
import { useMemo } from "react";
import { useCurrentFrame } from "remotion";

import { DEV } from "./Theme";

export const useRemotionTexture = (
  cb: (surface: SkSurface, frame: number) => void,
  size: SkSize
) => {
  const surface = useMemo(() => {
    const s = Skia.Surface.Make(size.width, size.height);
    console.log("make offscreen surface");
    if (!s) {
      throw new Error("Could not create offscreen surface");
    }
    return s;
  }, [size.height, size.width]);
  const frame = useCurrentFrame();
  cb(surface, frame);
  //surface.flush();
  const tex = surface.makeImageSnapshot()!;
  if (DEV) {
    const pixels = tex.readPixels() as Uint8Array;
    const info = tex.getImageInfo();
    return Skia.Image.MakeImage(
      info,
      Skia.Data.fromBytes(pixels),
      info.width * 4
    )!;
  }
  return tex;
};
