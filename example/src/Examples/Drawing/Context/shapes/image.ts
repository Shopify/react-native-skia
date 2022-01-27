import type { IImage } from "@shopify/react-native-skia";
import { Skia } from "@shopify/react-native-skia";

import type { DrawingElement } from "../types";

export const createImage = (
  x: number,
  y: number,
  image: IImage,
  color: number,
  size: number
): DrawingElement => {
  const path = Skia.Path.Make();
  path.addRect({ x, y, width: 1, height: 1 });
  return {
    type: "image",
    image,
    primitive: path,
    color,
    size,
  };
};
