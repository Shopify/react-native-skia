export const canvas2Cartesian = (v, center) => {
  "worklet";

  return {
    x: v.x - center.x,
    y: -1 * (v.y - center.y)
  };
};
export const cartesian2Canvas = (v, center) => {
  "worklet";

  return {
    x: v.x + center.x,
    y: -1 * v.y + center.y
  };
};
export const cartesian2Polar = v => {
  "worklet";

  return {
    theta: Math.atan2(v.y, v.x),
    radius: Math.sqrt(v.x ** 2 + v.y ** 2)
  };
};
export const polar2Cartesian = p => {
  "worklet";

  return {
    x: p.radius * Math.cos(p.theta),
    y: p.radius * Math.sin(p.theta)
  };
};
export const polar2Canvas = (p, center) => {
  "worklet";

  return cartesian2Canvas(polar2Cartesian(p), center);
};
export const canvas2Polar = (v, center) => {
  "worklet";

  return cartesian2Polar(canvas2Cartesian(v, center));
};
//# sourceMappingURL=Coordinates.js.map