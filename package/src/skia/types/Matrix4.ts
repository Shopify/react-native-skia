export type Vec3 = readonly [number, number, number];
export type Vec4 = readonly [number, number, number, number];

export type Matrix4 = readonly [
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number
];

type Transform3dName =
  | "translateX"
  | "translateY"
  | "translateZ"
  | "scale"
  | "scaleX"
  | "scaleY"
  | "skewX"
  | "skewY"
  | "rotateZ"
  | "rotate"
  | "perspective"
  | "rotateX"
  | "rotateY"
  | "rotateZ"
  | "matrix";

type Transformations = {
  [Name in Transform3dName]: Name extends "matrix" ? Matrix4 : number;
};

export type Transforms3d = (
  | Pick<Transformations, "translateX">
  | Pick<Transformations, "translateY">
  | Pick<Transformations, "translateZ">
  | Pick<Transformations, "scale">
  | Pick<Transformations, "scaleX">
  | Pick<Transformations, "scaleY">
  | Pick<Transformations, "skewX">
  | Pick<Transformations, "skewY">
  | Pick<Transformations, "perspective">
  | Pick<Transformations, "rotateX">
  | Pick<Transformations, "rotateY">
  | Pick<Transformations, "rotateZ">
  | Pick<Transformations, "rotate">
  | Pick<Transformations, "matrix">
)[];

/**
 * @worklet
 */
const exhaustiveCheck = (a: never): never => {
  "worklet";
  throw new Error(`Unexhaustive handling for ${a}`);
};

export const Matrix4 = (): Matrix4 => [
  1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1,
];

/**
 * @worklet
 */
const translate = (x: number, y: number, z: number): Matrix4 => {
  "worklet";
  return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, x, y, z, 1];
};

/**
 * @worklet
 */
const scale = (sx: number, sy: number, sz: number): Matrix4 => {
  "worklet";
  return [sx, 0, 0, 0, 0, sy, 0, 0, 0, 0, sz, 0, 0, 0, 0, 1];
};

/**
 * @worklet
 */
const skewX = (s: number): Matrix4 => {
  "worklet";
  return [1, 0, 0, 0, Math.tan(s), 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
};

/**
 * @worklet
 */
const skewY = (s: number): Matrix4 => {
  "worklet";
  return [1, Math.tan(s), 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
};

/**
 * @worklet
 */
const perspective = (p: number): Matrix4 => {
  "worklet";
  return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, -1 / p, 1];
};

/**
 * @worklet
 */
const rotateX = (r: number): Matrix4 => {
  "worklet";
  return [
    1,
    0,
    0,
    0,
    0,
    Math.cos(r),
    Math.sin(r),
    0,
    0,
    -Math.sin(r),
    Math.cos(r),
    0,
    0,
    0,
    0,
    1,
  ];
};

/**
 * @worklet
 */
const rotateY = (r: number): Matrix4 => {
  "worklet";
  return [
    Math.cos(r),
    0,
    -Math.sin(r),
    0,
    0,
    1,
    0,
    0,
    Math.sin(r),
    0,
    Math.cos(r),
    0,
    0,
    0,
    0,
    1,
  ];
};

/**
 * @worklet
 */
const rotateZ = (r: number): Matrix4 => {
  "worklet";
  return [
    Math.cos(r),
    Math.sin(r),
    0,
    0,
    -Math.sin(r),
    Math.cos(r),
    0,
    0,
    0,
    0,
    1,
    0,
    0,
    0,
    0,
    1,
  ];
};

/**
 * @worklet
 */
export const matrixVecMul4 = (m: Matrix4, v: Vec4) => {
  "worklet";
  const [vx, vy, vz, vw] = v;
  return [
    vx * m[0] + vy * m[4] + vz * m[8] + vw * m[12],
    vx * m[1] + vy * m[5] + vz * m[9] + vw * m[13],
    vx * m[2] + vy * m[6] + vz * m[10] + vw * m[14],
    vx * m[3] + vy * m[7] + vz * m[11] + vw * m[15],
  ];
};

/**
 * @worklet
 */
export const mapPoint3d = (m: Matrix4, v: Vec3) => {
  "worklet";
  const r = matrixVecMul4(m, [v[0], v[1], v[2], 1]);
  return [r[0] / r[3], r[1] / r[3], r[2] / r[3]] as const;
};

/**
 * @worklet
 */
export const multiply4 = (a: Matrix4, b: Matrix4) => {
  "worklet";
  const out = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  const a00 = a[0],
    a01 = a[1],
    a02 = a[2],
    a03 = a[3],
    a10 = a[4],
    a11 = a[5],
    a12 = a[6],
    a13 = a[7],
    a20 = a[8],
    a21 = a[9],
    a22 = a[10],
    a23 = a[11],
    a30 = a[12],
    a31 = a[13],
    a32 = a[14],
    a33 = a[15];

  let b0 = b[0],
    b1 = b[1],
    b2 = b[2],
    b3 = b[3];
  out[0] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
  out[1] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
  out[2] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
  out[3] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

  b0 = b[4];
  b1 = b[5];
  b2 = b[6];
  b3 = b[7];
  out[4] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
  out[5] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
  out[6] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
  out[7] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

  b0 = b[8];
  b1 = b[9];
  b2 = b[10];
  b3 = b[11];
  out[8] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
  out[9] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
  out[10] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
  out[11] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

  b0 = b[12];
  b1 = b[13];
  b2 = b[14];
  b3 = b[15];
  out[12] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
  out[13] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
  out[14] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
  out[15] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
  return out as unknown as Matrix4;
};

/**
 * @worklet
 */
export const toMatrix3 = (m: Matrix4) => {
  "worklet";
  return [m[0], m[1], m[3], m[5], m[6], m[8], m[12], m[13], m[15]];
};

/**
 * @worklet
 */
export const processTransform3d = (transforms: Transforms3d) => {
  "worklet";
  return toMatrix3(
    transforms.reduce((acc, transform) => {
      const key = Object.keys(transform)[0] as Transform3dName;
      if (key === "translateX") {
        const value = (transform as Pick<Transformations, typeof key>)[key];
        return multiply4(acc, translate(value, 0, 0));
      }
      if (key === "translateY") {
        const value = (transform as Pick<Transformations, typeof key>)[key];
        return multiply4(acc, translate(0, value, 0));
      }
      if (key === "translateZ") {
        const value = (transform as Pick<Transformations, typeof key>)[key];
        return multiply4(acc, translate(0, 0, value));
      }
      if (key === "scale") {
        const value = (transform as Pick<Transformations, typeof key>)[key];
        return multiply4(acc, scale(value, value, 1));
      }
      if (key === "scaleX") {
        const value = (transform as Pick<Transformations, typeof key>)[key];
        return multiply4(acc, scale(value, 1, 1));
      }
      if (key === "scaleY") {
        const value = (transform as Pick<Transformations, typeof key>)[key];
        return multiply4(acc, scale(1, value, 1));
      }
      if (key === "skewX") {
        const value = (transform as Pick<Transformations, typeof key>)[key];
        return multiply4(acc, skewX(value));
      }
      if (key === "skewY") {
        const value = (transform as Pick<Transformations, typeof key>)[key];
        return multiply4(acc, skewY(value));
      }
      if (key === "rotateX") {
        const value = (transform as Pick<Transformations, typeof key>)[key];
        return multiply4(acc, rotateX(value));
      }
      if (key === "rotateY") {
        const value = (transform as Pick<Transformations, typeof key>)[key];
        return multiply4(acc, rotateY(value));
      }
      if (key === "perspective") {
        const value = (transform as Pick<Transformations, typeof key>)[key];
        return multiply4(acc, perspective(value));
      }
      if (key === "rotate" || key === "rotateZ") {
        const value = (transform as Pick<Transformations, typeof key>)[key];
        return multiply4(acc, rotateZ(value));
      }
      if (key === "matrix") {
        const matrix = (transform as Pick<Transformations, typeof key>)[key];
        return multiply4(acc, matrix);
      }
      return exhaustiveCheck(key);
    }, Matrix4())
  );
};
