import type { ICanvas } from "@shopify/react-native-skia";

import type { DrawingElements } from "../types";

import { getBoundingBox } from "./getBoundingBox";
import { drawFocusRect } from "./drawFocusRect";
import { getBounds } from "./getBounds";

export const drawElements = (
  canvas: ICanvas,
  elements: DrawingElements,
  selectedElements: DrawingElements
) => {
  if (elements.length > 0) {
    // Render elements
    for (let i = 0; i < elements.length; i++) {
      const element = elements[i];

      switch (element.type) {
        case "image": {
          const dest = getBounds(element);
          const src = {
            x: 0,
            y: 0,
            width: element.image.width(),
            height: element.image.height(),
          };
          canvas.drawImageRect(element.image, src, dest, element.p, true);
          break;
        }
        default:
          canvas.drawPath(element.primitive, element.p);
          break;
      }
    }
    // Render selection focus
    const bb = getBoundingBox(selectedElements);
    if (bb) {
      drawFocusRect(canvas, bb);
    }
  }
};
