import type { IRect, ICanvas } from "@shopify/react-native-skia";
import { PaintStyle, Skia } from "@shopify/react-native-skia";

import type { DrawingElement, DrawingElements } from "./types";

export const getBounds = (element: DrawingElement, translate = true): IRect => {
  let rect: IRect;
  switch (element.type) {
    case "path":
      rect = element.primitive.computeTightBounds();
      break;
    case "rect":
    case "circle":
      rect = element.primitive;
      break;
  }
  if (translate) {
    const x = rect.x + (element.translate?.x ?? 0);
    const y = rect.y + (element.translate?.y ?? 0);
    return Skia.XYWHRect(x, y, rect.width, rect.height);
  } else {
    return Skia.XYWHRect(rect.x, rect.y, rect.width, rect.height);
  }
};

export const findElement = (
  x: number,
  y: number,
  elements: DrawingElements
) => {
  if (elements.length === 0) {
    return undefined;
  }
  const p = { x, y };
  const distances = elements
    .map((element) => {
      const rect = getBounds(element);
      // check if point is in rect
      if (
        p.x >= rect.x &&
        p.x < rect.x + rect.width &&
        p.y >= rect.y &&
        p.y < rect.y + rect.height
      ) {
        var dx = Math.max(rect.x - p.x, p.x - (rect.x + rect.width));
        var dy = Math.max(rect.y - p.y, p.y - (rect.y + rect.height));
        return { ...element, distance: Math.sqrt(dx * dx + dy * dy) };
      } else {
        return { ...element, distance: Number.MAX_VALUE };
      }
    })
    .sort((a, b) => a.distance - b.distance);
  return elements.find(
    (el) =>
      el.primitive === distances[0].primitive &&
      distances[0].distance < Number.MAX_VALUE
  );
};

const selectedPaintBg = Skia.Paint();
selectedPaintBg.setColor(Skia.Color("#4185F442"));
selectedPaintBg.setStyle(PaintStyle.Fill);

const selectedPaintBorder = Skia.Paint();
selectedPaintBorder.setColor(Skia.Color("#4185F4"));
selectedPaintBorder.setStyle(PaintStyle.Stroke);

export const drawFocus = (
  isSelected: boolean,
  canvas: ICanvas,
  rect: IRect,
  offset: number
) => {
  if (isSelected) {
    const selectedRect = Skia.XYWHRect(
      rect.x - offset / 2 - 1,
      rect.y - offset / 2 - 1,
      rect.width + offset + 2,
      rect.height + offset + 2
    );
    const rrect = Skia.RRectXY(selectedRect, 3, 3);
    canvas.drawRRect(rrect, selectedPaintBg);
    canvas.drawRRect(rrect, selectedPaintBorder);
  }
};
