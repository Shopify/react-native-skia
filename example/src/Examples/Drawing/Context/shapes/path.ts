import type { IPaint } from "@shopify/react-native-skia";
import { Skia } from "@shopify/react-native-skia";

import type { DrawingElement } from "../types";

export const createPath = (
  x: number,
  y: number,
  currentPaint: IPaint
): DrawingElement => {
  const path = Skia.Path.Make();
  path.moveTo(x, y);
  return {
    type: "path",
    primitive: path,
    p: currentPaint,
  };
};
