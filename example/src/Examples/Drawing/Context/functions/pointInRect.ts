import type { SkRect, SkPoint } from "@shopify/react-native-skia";

export const pointInRect = (p: SkPoint, rect: SkRect, offset = 10) => {
  return (
    p.x + offset >= rect.x &&
    p.x - offset <= rect.x + rect.width &&
    p.y + offset >= rect.y &&
    p.y - offset <= rect.y + rect.height
  );
};
