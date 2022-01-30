import type { DrawingElements } from "../types";

import { getBounds } from "./getBounds";

export const getBoundingBox = (elements: DrawingElements) => {
  if (elements.length === 0) {
    return undefined;
  }

  const bb = {
    x: Number.MAX_VALUE,
    y: Number.MAX_VALUE,
    right: Number.MIN_VALUE,
    bottom: Number.MIN_VALUE,
  };

  for (let i = 0; i < elements.length; i++) {
    const element = elements[i];
    const bounds = getBounds(element);

    if (bounds.x < bb.x) {
      bb.x = bounds.x;
    }
    if (bounds.y < bb.y) {
      bb.y = bounds.y;
    }
    if (bounds.x + bounds.width > bb.right) {
      bb.right = bounds.x + bounds.width;
    }
    if (bounds.y + bounds.height > bb.bottom) {
      bb.bottom = bounds.y + bounds.height;
    }
  }

  return { x: bb.x, y: bb.y, width: bb.right - bb.x, height: bb.bottom - bb.y };
};
