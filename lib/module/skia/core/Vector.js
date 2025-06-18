import { Skia } from "../Skia";
export const vec = (x = 0, y) => {
  "worklet";

  return Skia.Point(x, y !== null && y !== void 0 ? y : x);
};
export const point = vec;
export const neg = a => {
  "worklet";

  return vec(-a.x, -a.y);
};
export const add = (a, b) => {
  "worklet";

  return vec(a.x + b.x, a.y + b.y);
};
export const sub = (a, b) => {
  "worklet";

  return vec(a.x - b.x, a.y - b.y);
};
export const dist = (a, b) => {
  "worklet";

  return Math.hypot(a.x - b.x, a.y - b.y);
};
//# sourceMappingURL=Vector.js.map