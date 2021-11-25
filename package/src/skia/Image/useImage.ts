import type { ImageSourcePropType } from "react-native";
import { useMemo, useState } from "react";

import type { IImage } from "./Image";
import { ImageCtor } from "./Image";

/**
 * Returns a Skia Image object
 * */
export const useImage = (source: ImageSourcePropType) => {
  const [image, setImage] = useState<IImage | null>(null);
  useMemo(
    () =>
      ImageCtor(source).then((value) => {
        setImage(value);
      }),
    [source]
  );
  return image;
};

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
