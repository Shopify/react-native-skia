import type { SkRect } from "@shopify/react-native-skia";

import type { DrawingElement } from "../types";

export const getBounds = (element: DrawingElement): SkRect => {
  return element.path.getBounds() || element.path.computeTightBounds();
};
