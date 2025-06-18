// We have an issue to check property existence on JSI backed instances
export const isRRect = def => {
  "worklet";

  return typeof def === "object" && def !== null &&
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  typeof def.rect === "object";
};
//# sourceMappingURL=RRect.js.map