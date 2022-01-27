import { Skia } from "@shopify/react-native-skia";

import type { DrawingElement } from "../types";

export const createOval = (
  x: number,
  y: number,
  color: number,
  size: number
): DrawingElement => {
  const path = Skia.Path.Make();
  path.addOval({ x, y, width: 1, height: 1 });
  return {
    type: "circle",
    primitive: path,
    color,
    size,
  };
};
