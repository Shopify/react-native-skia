import { TileMode } from "../../../skia/types";
import { enumKey } from "./Enum";
import { processTransformProps } from "./Transform";
export const transformOrigin = (origin, transform) => {
  "worklet";

  return [{
    translateX: origin.x
  }, {
    translateY: origin.y
  }, ...transform, {
    translateX: -origin.x
  }, {
    translateY: -origin.y
  }];
};
export const processColor = (Skia, color) => {
  "worklet";

  if (typeof color === "string" || typeof color === "number") {
    return Skia.Color(color);
  } else if (Array.isArray(color) || color instanceof Float32Array) {
    return color instanceof Float32Array ? color : new Float32Array(color);
  } else {
    throw new Error(`Invalid color type: ${typeof color}. Expected number, string, or array.`);
  }
};
export const processGradientProps = (Skia, {
  colors,
  positions,
  mode,
  flags,
  ...transform
}) => {
  "worklet";

  const localMatrix = Skia.Matrix();
  processTransformProps(localMatrix, transform);
  return {
    colors: colors.map(color => processColor(Skia, color)),
    positions: positions !== null && positions !== void 0 ? positions : null,
    mode: TileMode[enumKey(mode !== null && mode !== void 0 ? mode : "clamp")],
    flags,
    localMatrix
  };
};
export const getRect = (Skia, props) => {
  "worklet";

  const {
    x,
    y,
    width,
    height
  } = props;
  if (props.rect) {
    return props.rect;
  } else if (width !== undefined && height !== undefined) {
    return Skia.XYWHRect(x !== null && x !== void 0 ? x : 0, y !== null && y !== void 0 ? y : 0, width, height);
  } else {
    return undefined;
  }
};
//# sourceMappingURL=Gradient.js.map