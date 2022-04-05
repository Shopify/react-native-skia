import type { SkImage } from "@shopify/react-native-skia";
import { Skia } from "@shopify/react-native-skia";

import type { DrawingElement } from "../types";

export const createImage = (
  x: number,
  y: number,
  image: SkImage,
  color: number,
  size: number
): DrawingElement => {
  const path = Skia.Path.Make();
  path.addRect({ x, y, width: 1, height: 1 });
  return {
    type: "image",
    image,
    path: path,
    color,
    size,
  };
};
