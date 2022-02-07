import type { IRect, Point } from "@shopify/react-native-skia";

export const pointInRect = (p: Point, rect: IRect, offset = 10) => {
  return (
    p.x + offset >= rect.x &&
    p.x - offset <= rect.x + rect.width &&
    p.y + offset >= rect.y &&
    p.y - offset <= rect.y + rect.height
  );
};
