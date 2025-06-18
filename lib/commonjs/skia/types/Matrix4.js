"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.translate = exports.toMatrix3 = exports.scale = exports.rotateZ = exports.rotateY = exports.rotateX = exports.processTransform3d = exports.pivot = exports.perspective = exports.multiply4 = exports.matrixVecMul4 = exports.mapPoint3d = exports.invert4 = exports.convertToColumnMajor = exports.convertToAffineMatrix = exports.Matrix4 = void 0;
const exhaustiveCheck = a => {
  "worklet";

  throw new Error(`Unexhaustive handling for ${a}`);
};

/**
 * @worklet
 */
const Matrix4 = () => {
  "worklet";

  return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
};

/**
 * @worklet
 */
exports.Matrix4 = Matrix4;
const translate = (x, y, z = 0) => {
  "worklet";

  return [1, 0, 0, x, 0, 1, 0, y, 0, 0, 1, z, 0, 0, 0, 1];
};

/**
 * @worklet
 */
exports.translate = translate;
const perspective = p => {
  "worklet";

  return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, -1 / p, 1];
};
exports.perspective = perspective;
const normalizeVec = vec => {
  "worklet";

  const [x, y, z] = vec;
  const length = Math.sqrt(x * x + y * y + z * z);
  // Check for zero length to avoid division by zero
  if (length === 0) {
    return [0, 0, 0];
  }
  return [x / length, y / length, z / length];
};
const rotatedUnitSinCos = (axisVec, sinAngle, cosAngle) => {
  "worklet";

  const x = axisVec[0];
  const y = axisVec[1];
  const z = axisVec[2];
  const c = cosAngle;
  const s = sinAngle;
  const t = 1 - c;
  return [t * x * x + c, t * x * y - s * z, t * x * z + s * y, 0, t * x * y + s * z, t * y * y + c, t * y * z - s * x, 0, t * x * z - s * y, t * y * z + s * x, t * z * z + c, 0, 0, 0, 0, 1];
};

/**
 * @worklet
 */
const matrixVecMul4 = (m, v) => {
  "worklet";

  return [m[0] * v[0] + m[1] * v[1] + m[2] * v[2] + m[3] * v[3], m[4] * v[0] + m[5] * v[1] + m[6] * v[2] + m[7] * v[3], m[8] * v[0] + m[9] * v[1] + m[10] * v[2] + m[11] * v[3], m[12] * v[0] + m[13] * v[1] + m[14] * v[2] + m[15] * v[3]];
};

/**
 * @worklet
 */
exports.matrixVecMul4 = matrixVecMul4;
const mapPoint3d = (m, v) => {
  "worklet";

  const r = matrixVecMul4(m, [...v, 1]);
  return [r[0] / r[3], r[1] / r[3], r[2] / r[3]];
};

/**
 * @worklet
 */
exports.mapPoint3d = mapPoint3d;
const multiply4 = (a, b) => {
  "worklet";

  const result = new Array(16).fill(0);
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      result[i * 4 + j] = a[i * 4] * b[j] + a[i * 4 + 1] * b[j + 4] + a[i * 4 + 2] * b[j + 8] + a[i * 4 + 3] * b[j + 12];
    }
  }
  return result;
};
exports.multiply4 = multiply4;
const skewY = angle => {
  "worklet";

  return [1, Math.tan(angle), 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
};
const skewX = angle => {
  "worklet";

  return [1, 0, 0, 0, Math.tan(angle), 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
};

/**
 * @worklet
 */
const toMatrix3 = m => {
  "worklet";

  return [m[0], m[1], m[3], m[4], m[5], m[7], m[12], m[13], m[15]];
};
exports.toMatrix3 = toMatrix3;
const rotate = (axis, value) => {
  "worklet";

  return rotatedUnitSinCos(normalizeVec(axis), Math.sin(value), Math.cos(value));
};

/**
 * @worklet
 */
const pivot = (m, p) => {
  "worklet";

  return multiply4(translate(p.x, p.y), multiply4(m, translate(-p.x, -p.y)));
};

/**
 * @worklet
 */
exports.pivot = pivot;
const scale = (sx, sy, sz = 1, p) => {
  "worklet";

  const m4 = [sx, 0, 0, 0, 0, sy, 0, 0, 0, 0, sz, 0, 0, 0, 0, 1];
  if (p) {
    return pivot(m4, p);
  }
  return m4;
};
exports.scale = scale;
const rotateAxis = (axis, angle, p) => {
  "worklet";

  const result = rotate(axis, angle);
  if (p) {
    return pivot(result, p);
  }
  return result;
};

/**
 * @worklet
 */
const rotateZ = (value, p) => {
  "worklet";

  return rotateAxis([0, 0, 1], value, p);
};

/**
 * @worklet
 */
exports.rotateZ = rotateZ;
const rotateX = (value, p) => {
  "worklet";

  return rotateAxis([1, 0, 0], value, p);
};

/**
 * @worklet
 */
exports.rotateX = rotateX;
const rotateY = (value, p) => {
  "worklet";

  return rotateAxis([0, 1, 0], value, p);
};

/**
 * @worklet
 */
exports.rotateY = rotateY;
const processTransform3d = transforms => {
  "worklet";

  return transforms.reduce((acc, val) => {
    const key = Object.keys(val)[0];
    const transform = val;
    if (key === "translateX") {
      const value = transform[key];
      return multiply4(acc, translate(value, 0, 0));
    }
    if (key === "translate") {
      const [x, y, z = 0] = transform[key];
      return multiply4(acc, translate(x, y, z));
    }
    if (key === "translateY") {
      const value = transform[key];
      return multiply4(acc, translate(0, value, 0));
    }
    if (key === "translateZ") {
      const value = transform[key];
      return multiply4(acc, translate(0, 0, value));
    }
    if (key === "scale") {
      const value = transform[key];
      return multiply4(acc, scale(value, value, 1));
    }
    if (key === "scaleX") {
      const value = transform[key];
      return multiply4(acc, scale(value, 1, 1));
    }
    if (key === "scaleY") {
      const value = transform[key];
      return multiply4(acc, scale(1, value, 1));
    }
    if (key === "skewX") {
      const value = transform[key];
      return multiply4(acc, skewX(value));
    }
    if (key === "skewY") {
      const value = transform[key];
      return multiply4(acc, skewY(value));
    }
    if (key === "rotateX") {
      const value = transform[key];
      return multiply4(acc, rotate([1, 0, 0], value));
    }
    if (key === "rotateY") {
      const value = transform[key];
      return multiply4(acc, rotate([0, 1, 0], value));
    }
    if (key === "perspective") {
      const value = transform[key];
      return multiply4(acc, perspective(value));
    }
    if (key === "rotate" || key === "rotateZ") {
      const value = transform[key];
      return multiply4(acc, rotate([0, 0, 1], value));
    }
    if (key === "matrix") {
      const value = transform[key];
      return multiply4(acc, value);
    }
    return exhaustiveCheck(key);
  }, Matrix4());
};

/**
 * @worklet
 */
exports.processTransform3d = processTransform3d;
const convertToColumnMajor = rowMajorMatrix => {
  "worklet";

  const colMajorMatrix = new Array(16);
  const size = 4;
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      colMajorMatrix[col * size + row] = rowMajorMatrix[row * size + col];
    }
  }
  return colMajorMatrix;
};

/**
 * @worklet
 */
exports.convertToColumnMajor = convertToColumnMajor;
const convertToAffineMatrix = m4 => {
  "worklet";

  // Extracting the relevant components from the 4x4 matrix
  const a = m4[0]; // Scale X
  const b = m4[1]; // Skew Y
  const c = m4[4]; // Skew X
  const d = m4[5]; // Scale Y
  const tx = m4[12]; // Translate X
  const ty = m4[13]; // Translate Y

  // Returning the 6-element affine transformation matrix
  return [a, b, c, d, tx, ty];
};

/**
 * Calculates the determinant of a 3x3 matrix
 * @worklet
 */
exports.convertToAffineMatrix = convertToAffineMatrix;
const det3x3 = (a00, a01, a02, a10, a11, a12, a20, a21, a22) => {
  "worklet";

  return a00 * (a11 * a22 - a12 * a21) + a01 * (a12 * a20 - a10 * a22) + a02 * (a10 * a21 - a11 * a20);
};

/**
 * Inverts a 4x4 matrix
 * @worklet
 * @returns The inverted matrix, or the identity matrix if the input is not invertible
 */
const invert4 = m => {
  "worklet";

  const a00 = m[0],
    a01 = m[1],
    a02 = m[2],
    a03 = m[3];
  const a10 = m[4],
    a11 = m[5],
    a12 = m[6],
    a13 = m[7];
  const a20 = m[8],
    a21 = m[9],
    a22 = m[10],
    a23 = m[11];
  const a30 = m[12],
    a31 = m[13],
    a32 = m[14],
    a33 = m[15];

  // Calculate cofactors
  const b00 = det3x3(a11, a12, a13, a21, a22, a23, a31, a32, a33);
  const b01 = -det3x3(a10, a12, a13, a20, a22, a23, a30, a32, a33);
  const b02 = det3x3(a10, a11, a13, a20, a21, a23, a30, a31, a33);
  const b03 = -det3x3(a10, a11, a12, a20, a21, a22, a30, a31, a32);
  const b10 = -det3x3(a01, a02, a03, a21, a22, a23, a31, a32, a33);
  const b11 = det3x3(a00, a02, a03, a20, a22, a23, a30, a32, a33);
  const b12 = -det3x3(a00, a01, a03, a20, a21, a23, a30, a31, a33);
  const b13 = det3x3(a00, a01, a02, a20, a21, a22, a30, a31, a32);
  const b20 = det3x3(a01, a02, a03, a11, a12, a13, a31, a32, a33);
  const b21 = -det3x3(a00, a02, a03, a10, a12, a13, a30, a32, a33);
  const b22 = det3x3(a00, a01, a03, a10, a11, a13, a30, a31, a33);
  const b23 = -det3x3(a00, a01, a02, a10, a11, a12, a30, a31, a32);
  const b30 = -det3x3(a01, a02, a03, a11, a12, a13, a21, a22, a23);
  const b31 = det3x3(a00, a02, a03, a10, a12, a13, a20, a22, a23);
  const b32 = -det3x3(a00, a01, a03, a10, a11, a13, a20, a21, a23);
  const b33 = det3x3(a00, a01, a02, a10, a11, a12, a20, a21, a22);

  // Calculate determinant
  const det = a00 * b00 + a01 * b01 + a02 * b02 + a03 * b03;

  // Check if matrix is invertible
  if (Math.abs(det) < 1e-8) {
    // Return identity matrix if not invertible
    return Matrix4();
  }
  const invDet = 1.0 / det;

  // Calculate inverse matrix
  return [b00 * invDet, b10 * invDet, b20 * invDet, b30 * invDet, b01 * invDet, b11 * invDet, b21 * invDet, b31 * invDet, b02 * invDet, b12 * invDet, b22 * invDet, b32 * invDet, b03 * invDet, b13 * invDet, b23 * invDet, b33 * invDet];
};
exports.invert4 = invert4;
//# sourceMappingURL=Matrix4.js.map