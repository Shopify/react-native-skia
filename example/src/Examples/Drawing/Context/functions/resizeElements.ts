import { Skia } from "@shopify/react-native-skia";
import type { IRect } from "@shopify/react-native-skia";

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
  let dest: IRect;
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

  const matrix = Skia.Matrix();
  const scaleX = dest.width / source.width;
  const scaleY = dest.height / source.height;
  matrix.setScaleX(scaleX);
  matrix.setScaleY(scaleY);
  matrix.setTranslateX(dest.x - source.x * scaleX);
  matrix.setTranslateY(dest.y - source.y * scaleY);

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
  bounds: IRect
) => {
  return {
    x: bounds.x + x,
    y: bounds.y + y,
    width: bounds.width + r,
    height: bounds.height + b,
  };
};
