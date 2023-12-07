type Vec2 = readonly [number, number];
type Vec3 = readonly [number, number, number];
type Vec4 = readonly [number, number, number, number];

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
  | "translate"
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
  [Name in Transform3dName]: Name extends "matrix"
    ? Matrix4
    : Name extends "translate"
    ? Vec3 | Vec2
    : number;
};

export type Transforms3d = (
  | Pick<Transformations, "translateX">
  | Pick<Transformations, "translateY">
  | Pick<Transformations, "translateZ">
  | Pick<Transformations, "translate">
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

/**
 * @worklet
 */
export const Matrix4 = (): Matrix4 => {
  "worklet";
  return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
};

const translate = (x: number, y: number, z: number): Matrix4 => {
  "worklet";
  return [1, 0, 0, x, 0, 1, 0, y, 0, 0, 1, z, 0, 0, 0, 1];
};

const scale = (sx: number, sy: number, sz: number): Matrix4 => {
  "worklet";
  return [sx, 0, 0, 0, 0, sy, 0, 0, 0, 0, sz, 0, 0, 0, 0, 1];
};

const skewX = (s: number): Matrix4 => {
  "worklet";
  return [1, 0, 0, 0, Math.tan(s), 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
};

const skewY = (s: number): Matrix4 => {
  "worklet";
  return [1, Math.tan(s), 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
};

const perspective = (p: number): Matrix4 => {
  "worklet";
  return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, -1 / p, 1];
};

const normalizeVec = (vec: Vec3): Vec3 => {
  "worklet";
  const [x, y, z] = vec;
  const length = Math.sqrt(x * x + y * y + z * z);
  // Check for zero length to avoid division by zero
  if (length === 0) {
    return [0, 0, 0];
  }
  return [x / length, y / length, z / length];
};

const rotatedUnitSinCos = (
  axisVec: Vec3,
  sinAngle: number,
  cosAngle: number
): Matrix4 => {
  "worklet";
  const x = axisVec[0];
  const y = axisVec[1];
  const z = axisVec[2];
  const c = cosAngle;
  const s = sinAngle;
  const t = 1 - c;
  return [
    t * x * x + c,
    t * x * y - s * z,
    t * x * z + s * y,
    0,
    t * x * y + s * z,
    t * y * y + c,
    t * y * z - s * x,
    0,
    t * x * z - s * y,
    t * y * z + s * x,
    t * z * z + c,
    0,
    0,
    0,
    0,
    1,
  ];
};

const rotate = (axis: Vec3, value: number) => {
  "worklet";
  return rotatedUnitSinCos(
    normalizeVec(axis),
    Math.sin(value),
    Math.cos(value)
  );
};

const matrixVecMul4 = (m: Matrix4, v: Vec4) => {
  "worklet";
  const [vx, vy, vz, vw] = v;
  return [
    vx * m[0] + vy * m[4] + vz * m[8] + vw * m[12],
    vx * m[1] + vy * m[5] + vz * m[9] + vw * m[13],
    vx * m[2] + vy * m[6] + vz * m[10] + vw * m[14],
    vx * m[3] + vy * m[7] + vz * m[11] + vw * m[15],
  ];
};

/*
 * @worklet
 */
export const mapPoint3d = (m: Matrix4, v: Vec3) => {
  "worklet";
  const r = matrixVecMul4(m, [v[0], v[1], v[2], 1]);
  return [r[0] / r[3], r[1] / r[3], r[2] / r[3]] as const;
};

const multiply4 = (a: Matrix4, b: Matrix4): Matrix4 => {
  "worklet";
  const result = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      result[i * 4 + j] =
        a[i * 4] * b[j] +
        a[i * 4 + 1] * b[j + 4] +
        a[i * 4 + 2] * b[j + 8] +
        a[i * 4 + 3] * b[j + 12];
    }
  }

  return result as unknown as Matrix4;
};

const toMatrix3 = (m: Matrix4) => {
  "worklet";
  return [m[0], m[1], m[3], m[4], m[5], m[7], m[12], m[13], m[15]];
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
      if (key === "translate") {
        const [x, y, z = 0] = (transform as Pick<Transformations, typeof key>)[
          key
        ];
        return multiply4(acc, translate(x, y, z));
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
        return multiply4(acc, rotate([1, 0, 0], value));
      }
      if (key === "rotateY") {
        const value = (transform as Pick<Transformations, typeof key>)[key];
        return multiply4(acc, rotate([0, 1, 0], value));
      }
      if (key === "perspective") {
        const value = (transform as Pick<Transformations, typeof key>)[key];
        return multiply4(acc, perspective(value));
      }
      if (key === "rotate" || key === "rotateZ") {
        const value = (transform as Pick<Transformations, typeof key>)[key];
        return multiply4(acc, rotate([0, 0, 1], value));
      }
      if (key === "matrix") {
        const matrix = (transform as Pick<Transformations, typeof key>)[key];
        return multiply4(acc, matrix);
      }
      return exhaustiveCheck(key);
    }, Matrix4())
  );
};
