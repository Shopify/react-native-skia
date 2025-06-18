import { processTransform } from "../../../skia/types";
export const processTransformProps = (m3, props) => {
  "worklet";

  const {
    transform,
    origin,
    matrix
  } = props;
  if (matrix) {
    if (origin) {
      m3.translate(origin.x, origin.y);
      m3.concat(matrix);
      m3.translate(-origin.x, -origin.y);
    } else {
      m3.concat(matrix);
    }
  } else if (transform) {
    if (origin) {
      m3.translate(origin.x, origin.y);
    }
    processTransform(m3, transform);
    if (origin) {
      m3.translate(-origin.x, -origin.y);
    }
  }
};
export const processTransformProps2 = (Skia, props) => {
  "worklet";

  const {
    transform,
    origin,
    matrix
  } = props;
  if (matrix) {
    const m3 = Skia.Matrix();
    if (origin) {
      m3.translate(origin.x, origin.y);
      m3.concat(matrix);
      m3.translate(-origin.x, -origin.y);
    } else {
      m3.concat(matrix);
    }
    return m3;
  } else if (transform) {
    const m3 = Skia.Matrix();
    if (origin) {
      m3.translate(origin.x, origin.y);
    }
    processTransform(m3, transform);
    if (origin) {
      m3.translate(-origin.x, -origin.y);
    }
    return m3;
  }
  return null;
};
//# sourceMappingURL=Transform.js.map