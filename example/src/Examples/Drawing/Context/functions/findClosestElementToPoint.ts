import type { Point } from "@shopify/react-native-skia";

import type { DrawingElements } from "../types";

import { getBounds } from "./getBounds";

export const findClosestElementToPoint = (
  point: Point,
  elements: DrawingElements
) => {
  // Empty elements returns undefined
  if (elements.length === 0) {
    return undefined;
  }
  // Check if we any of the paths (in reverse top-down order) contains the point
  for (let i = elements.length - 1; i >= 0; i--) {
    if (elements[i].path.contains(point.x, point.y)) {
      return elements[i];
    }
  }
  // If not, measure distance to the closest path
  const distances = elements
    .map((element) => {
      const rect = getBounds(element);
      // check if point is in rect
      if (
        point.x >= rect.x - 10 &&
        point.x < rect.x + rect.width + 10 &&
        point.y >= rect.y - 10 &&
        point.y < rect.y + rect.height + 10
      ) {
        // Find distance from click to center of element
        var dx = Math.max(rect.x - point.x, point.x - (rect.x + rect.width));
        var dy = Math.max(rect.y - point.y, point.y - (rect.y + rect.height));
        return { ...element, distance: Math.sqrt(dx * dx + dy * dy) };
      } else {
        return { ...element, distance: Number.MAX_VALUE };
      }
    })
    .sort((a, b) => a.distance - b.distance);

  return elements.find(
    (el) =>
      el.path === distances[0].path && distances[0].distance < Number.MAX_VALUE
  );
};
