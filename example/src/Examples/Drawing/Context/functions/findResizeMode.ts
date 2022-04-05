import type { SkPoint } from "@shopify/react-native-skia";

import type { DrawingElements, ResizeMode } from "../types";

import { getBoundingBox } from "./getBoundingBox";

const hitSlop = 8;

export const findResizeMode = (
  point: SkPoint,
  selectedElements: DrawingElements
): ResizeMode | undefined => {
  const bounds = getBoundingBox(selectedElements);
  if (!bounds) {
    return undefined;
  }

  if (
    point.x >= bounds.x - hitSlop &&
    point.x <= bounds.x + hitSlop &&
    point.y >= bounds.y - hitSlop &&
    point.y <= bounds.y + hitSlop
  ) {
    return "topLeft";
  } else if (
    point.x >= bounds.x + bounds.width - hitSlop &&
    point.x <= bounds.x + bounds.width + hitSlop &&
    point.y >= bounds.y - hitSlop &&
    point.y <= bounds.y + hitSlop
  ) {
    return "topRight";
  } else if (
    point.x >= bounds.x + bounds.width - hitSlop &&
    point.x <= bounds.x + bounds.width + hitSlop &&
    point.y >= bounds.y + bounds.height - hitSlop &&
    point.y <= bounds.y + bounds.height + hitSlop
  ) {
    return "bottomRight";
  } else if (
    point.x >= bounds.x - hitSlop &&
    point.x <= bounds.x + hitSlop &&
    point.y >= bounds.y + bounds.height - hitSlop &&
    point.y <= bounds.y + bounds.height + hitSlop
  ) {
    return "bottomLeft";
  }
  return undefined;
};
