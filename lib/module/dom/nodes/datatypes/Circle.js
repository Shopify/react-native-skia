export const isCircleScalarDef = def => {
  "worklet";

  // We have an issue to check property existence on JSI backed instances
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return def.cx !== undefined;
};
export const processCircle = def => {
  "worklet";

  var _def$c;
  if (isCircleScalarDef(def)) {
    return {
      c: {
        x: def.cx,
        y: def.cy
      },
      r: def.r
    };
  }
  return {
    ...def,
    c: (_def$c = def.c) !== null && _def$c !== void 0 ? _def$c : {
      x: 0,
      y: 0
    }
  };
};
//# sourceMappingURL=Circle.js.map