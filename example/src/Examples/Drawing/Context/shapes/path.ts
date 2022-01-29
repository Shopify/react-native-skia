import { Skia } from "@shopify/react-native-skia";

import type { DrawingElement } from "../types";

export const createPath = (
  x: number,
  y: number,
  color: number,
  size: number
): DrawingElement => {
  const path = Skia.Path.Make();
  path.moveTo(x, y);
  return {
    type: "path",
    path: path,
    color,
    size,
  };
};
