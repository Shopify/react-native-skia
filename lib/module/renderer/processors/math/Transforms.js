import { canvas2Polar, polar2Canvas } from "./Coordinates";
export const rotate = (tr, origin, rotation) => {
  "worklet";

  const {
    radius,
    theta
  } = canvas2Polar(tr, origin);
  return polar2Canvas({
    radius,
    theta: theta + rotation
  }, origin);
};
//# sourceMappingURL=Transforms.js.map