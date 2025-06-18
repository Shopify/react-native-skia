import { Skia } from "../Skia";
import { isRRect } from "../types";
import { vec } from "./Vector";
export const rect = (x, y, width, height) => {
  "worklet";

  return Skia.XYWHRect(x, y, width, height);
};
export const bounds = rects => {
  "worklet";

  const x = Math.min(...rects.map(r => r.x));
  const y = Math.min(...rects.map(r => r.y));
  const width = Math.max(...rects.map(r => r.x + r.width));
  const height = Math.max(...rects.map(r => r.y + r.height));
  return rect(x, y, width - x, height - y);
};
export const topLeft = r => {
  "worklet";

  return isRRect(r) ? vec(r.rect.x, r.rect.y) : vec(r.x, r.y);
};
export const topRight = r => {
  "worklet";

  return isRRect(r) ? vec(r.rect.x + r.rect.width, r.rect.y) : vec(r.x + r.width, r.y);
};
export const bottomLeft = r => {
  "worklet";

  return isRRect(r) ? vec(r.rect.x, r.rect.y + r.rect.height) : vec(r.x, r.y + r.height);
};
export const bottomRight = r => {
  "worklet";

  return isRRect(r) ? vec(r.rect.x + r.rect.width, r.rect.y + r.rect.height) : vec(r.x + r.width, r.y + r.height);
};
export const center = r => {
  "worklet";

  return isRRect(r) ? vec(r.rect.x + r.rect.width / 2, r.rect.y + r.rect.height / 2) : vec(r.x + r.width / 2, r.y + r.height / 2);
};
//# sourceMappingURL=Rect.js.map