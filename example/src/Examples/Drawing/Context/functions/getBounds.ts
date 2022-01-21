import type { IRect } from "@shopify/react-native-skia";

import type { DrawingElement } from "../types";

export const getBounds = (element: DrawingElement): IRect => {
  return element.primitive.computeTightBounds();
};
