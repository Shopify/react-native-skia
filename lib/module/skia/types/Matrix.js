import { processTransform3d } from "./Matrix4";
export const isMatrix = obj => obj !== null && obj.__typename__ === "Matrix";
export const processTransform = (m, transforms) => {
  "worklet";

  const m3 = processTransform3d(transforms);
  m.concat(m3);
  return m;
};
export const toDegrees = rad => {
  return rad * 180 / Math.PI;
};
//# sourceMappingURL=Matrix.js.map