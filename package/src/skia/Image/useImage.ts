import type { ImageSourcePropType } from "react-native";
import { useMemo, useState } from "react";

import type { IImage } from "./Image";
import { ImageCtor } from "./Image";

/**
 * Returns a Skia Image object
 * */
export const useImage = (source: ImageSourcePropType) => {
  const [image, setImage] = useState<IImage>();
  useMemo(
    () =>
      ImageCtor(source).then((value) => {
        setImage(value);
      }),
    [source]
  );
  return image;
};

// interface Dimension {
//   width: number;
//   height: number;
// }
// These behave like https://reactnative.dev/docs/image#resizemode
// export type ResizeMode = "cover" | "contain" | "stretch" | "center" | "repeat";

// const resize = (image: Dimension, container: Dimension, mode: ResizeMode) => {
//   const containerImgWidthRatio = container.width / image.width;
//   const containerImgHeightRatio = container.height / image.height;
//   const m = Skia.Matrix();
//   switch (mode) {
//     case "cover": {
//       const scale = Math.max(containerImgWidthRatio, containerImgHeightRatio);
//       if (containerImgWidthRatio > containerImgHeightRatio) {
//         const c = container.height;
//         const i = image.height * scale;
//         const tr = (c - i) / 2;
//         m.setTranslateY(tr);
//       } else {
//         const c = container.width;
//         const i = image.width * scale;
//         const tr = (c - i) / 2;
//         m.setTranslateX(tr);
//       }
//       m.setScaleX(scale);
//       m.setScaleY(scale);
//       break;
//     }
//     case "center": {
//       m.setRectToRect(
//         Skia.XYWHRect(0, 0, image.width, image.height),
//         Skia.XYWHRect(0, 0, container.width, container.height),
//         ScaleToFit.Center
//       );
//       break;
//     }
//     case "stretch": {
//       m.setScaleX(containerImgWidthRatio);
//       m.setScaleY(containerImgHeightRatio);
//       break;
//     }
//     case "contain": {
//       const scale = Math.min(containerImgWidthRatio, containerImgHeightRatio);
//       m.setScaleX(scale);
//       m.setScaleY(scale);
//       break;
//     }
//     default:
//     // do nothing
//   }
//   return m;
// };

// export const useImageShader = (
//   source: ImageSourcePropType,
//   container: Dimension,
//   resizeMode: ResizeMode = "cover"
// ) => {
//   const image = useImage(source);
//   if (image) {
//     const tileMode = resizeMode === "repeat" ? TileMode.Repeat : TileMode.Decal;
//     return image.makeShaderOptions(
//       tileMode,
//       tileMode,
//       FilterMode.Nearest,
//       MipmapMode.None,
//       resize(
//         { width: image.width(), height: image.height() },
//         container,
//         resizeMode
//       )
//     );
//   }
//   return undefined;
// };
