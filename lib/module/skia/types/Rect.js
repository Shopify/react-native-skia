export const isRect = def => {
  "worklet";

  if (typeof def === "object" && def !== null) {
    const rect = def;
    return typeof rect.x === "number" && typeof rect.y === "number" && typeof rect.width === "number" && typeof rect.height === "number";
  }
  return false;
};
//# sourceMappingURL=Rect.js.map