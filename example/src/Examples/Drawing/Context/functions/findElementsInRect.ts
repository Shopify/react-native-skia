import type { IRect } from "@shopify/react-native-skia";

import type { DrawingElements } from "../types";

import { getBounds } from "./getBounds";

export const findElementsInRect = (
  rect: IRect,
  elements: DrawingElements
): DrawingElements | undefined => {
  const retVal: DrawingElements = [];
  const normalizedRect = {
    x: rect.width < 0 ? rect.x + rect.width : rect.x,
    y: rect.height < 0 ? rect.y + rect.height : rect.y,
    width: Math.abs(rect.width),
    height: Math.abs(rect.height),
  };
  elements.forEach((element) => {
    const bounds = getBounds(element);
    if (
      bounds.x >= normalizedRect.x &&
      bounds.x + bounds.width <= normalizedRect.x + normalizedRect.width &&
      bounds.y >= normalizedRect.y &&
      bounds.y + bounds.height <= normalizedRect.y + normalizedRect.height
    ) {
      retVal.push(element);
    }
  });

  if (retVal.length > 0) {
    return retVal;
  }
  return undefined;
};
