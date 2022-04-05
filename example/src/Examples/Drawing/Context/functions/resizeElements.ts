import { processTransform2d } from "@shopify/react-native-skia";
import type { SkRect } from "@shopify/react-native-skia";

import type { DrawingElements, ResizeMode } from "../types";

import { getBoundingBox } from "./getBoundingBox";

export const resizeElementsBy = (
  sx: number,
  sy: number,
  resizeMode: ResizeMode | undefined,
  elements: DrawingElements
) => {
  const source = getBoundingBox(elements);
  if (source === undefined) {
    return;
  }
  let dest: SkRect;
  switch (resizeMode) {
    case "topLeft":
      dest = resizeBounds(sx, sy, -sx, -sy, source);
      break;
    case "topRight":
      dest = resizeBounds(0, sy, sx, -sy, source);
      break;
    case "bottomLeft":
      dest = resizeBounds(sx, 0, -sx, sy, source);
      break;
    case "bottomRight":
      dest = resizeBounds(0, 0, sx, sy, source);
      break;
    case undefined:
      dest = resizeBounds(sx, sy, 0, 0, source);
  }

  if (dest.width <= 0 || dest.height <= 0) {
    return;
  }

  const scaleX = dest.width / source.width;
  const scaleY = dest.height / source.height;
  const translateX = dest.x - source.x * scaleX;
  const translateY = dest.y - source.y * scaleY;
  const matrix = processTransform2d([
    { translateX },
    { translateY },
    { scaleX },
    { scaleY },
  ]);
  // use to scale elements
  for (let i = 0; i < elements.length; i++) {
    const element = elements[i];
    element.path.transform(matrix);
  }
};

const resizeBounds = (
  x: number,
  y: number,
  r: number,
  b: number,
  bounds: SkRect
) => {
  return {
    x: bounds.x + x,
    y: bounds.y + y,
    width: bounds.width + r,
    height: bounds.height + b,
  };
};
