import type { Point } from "@shopify/react-native-skia";

import type { DrawingElements, ResizeMode } from "../types";

import { getBoundingBox } from "./getBoundingBox";

export const findResizeMode = (
  point: Point,
  selectedElements: DrawingElements
): ResizeMode | undefined => {
  const bounds = getBoundingBox(selectedElements);
  if (!bounds) {
    return undefined;
  }

  if (
    point.x >= bounds.x - 10 &&
    point.x <= bounds.x + 10 &&
    point.y >= bounds.y - 10 &&
    point.y <= bounds.y + 10
  ) {
    return "topLeft";
  } else if (
    point.x >= bounds.x + bounds.width - 10 &&
    point.x <= bounds.x + bounds.width + 10 &&
    point.y >= bounds.y - 10 &&
    point.y <= bounds.y + 10
  ) {
    return "topRight";
  } else if (
    point.x >= bounds.x + bounds.width - 10 &&
    point.x <= bounds.x + bounds.width + 10 &&
    point.y >= bounds.y + bounds.height - 10 &&
    point.y <= bounds.y + bounds.height + 10
  ) {
    return "bottomRight";
  } else if (
    point.x >= bounds.x - 10 &&
    point.x <= bounds.x + 10 &&
    point.y >= bounds.y + bounds.height - 10 &&
    point.y <= bounds.y + bounds.height + 10
  ) {
    return "bottomLeft";
  }
  return undefined;
};
