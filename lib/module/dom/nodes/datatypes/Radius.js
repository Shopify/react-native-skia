export const processRadius = (Skia, radius) => {
  "worklet";

  if (typeof radius === "number") {
    return Skia.Point(radius, radius);
  }
  return radius;
};
//# sourceMappingURL=Radius.js.map