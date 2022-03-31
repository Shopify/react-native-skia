export type Vec4 = readonly [number, number, number, number];

export type Matrix4 = readonly [Vec4, Vec4, Vec4, Vec4];

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

const exhaustiveCheck = (a: never): never => {
  throw new Error(`Unexhaustive handling for ${a}`);
};

export const identityMatrix4: Matrix4 = [
  [1, 0, 0, 0],
  [0, 1, 0, 0],
  [0, 0, 1, 0],
  [0, 0, 0, 1],
];

const translateXMatrix = (x: number): Matrix4 => {
  "worklet";
  return [
    [1, 0, 0, x],
    [0, 1, 0, 0],
    [0, 0, 1, 0],
    [0, 0, 0, 1],
  ];
};

const translateYMatrix = (y: number): Matrix4 => {
  "worklet";
  return [
    [1, 0, 0, 0],
    [0, 1, 0, y],
    [0, 0, 1, 0],
    [0, 0, 0, 1],
  ];
};

const translateZMatrix = (z: number): Matrix4 => {
  "worklet";
  return [
    [1, 0, 0, 0],
    [0, 1, 0, 0],
    [0, 0, 1, z],
    [0, 0, 0, 1],
  ];
};

const scaleMatrix = (s: number): Matrix4 => {
  "worklet";
  return [
    [s, 0, 0, 0],
    [0, s, 0, 0],
    [0, 0, 1, 0],
    [0, 0, 0, 1],
  ];
};

const scaleXMatrix = (s: number): Matrix4 => {
  "worklet";
  return [
    [s, 0, 0, 0],
    [0, 1, 0, 0],
    [0, 0, 1, 0],
    [0, 0, 0, 1],
  ];
};

const skewXMatrix = (s: number): Matrix4 => {
  "worklet";
  return [
    [1, Math.tan(s), 0, 0],
    [0, 1, 0, 0],
    [0, 0, 1, 0],
    [0, 0, 0, 1],
  ];
};

const skewYMatrix = (s: number): Matrix4 => {
  "worklet";
  return [
    [1, 0, 0, 0],
    [Math.tan(s), 1, 0, 0],
    [0, 0, 1, 0],
    [0, 0, 0, 1],
  ];
};

const scaleYMatrix = (s: number): Matrix4 => {
  "worklet";
  return [
    [1, 0, 0, 0],
    [0, s, 0, 0],
    [0, 0, 1, 0],
    [0, 0, 0, 1],
  ];
};

const perspectiveMatrix = (p: number): Matrix4 => {
  "worklet";
  return [
    [1, 0, 0, 0],
    [0, 1, 0, 0],
    [0, 0, 1, 0],
    [0, 0, -1 / p, 1],
  ];
};

const rotateXMatrix = (r: number): Matrix4 => {
  "worklet";
  return [
    [1, 0, 0, 0],
    [0, Math.cos(r), -Math.sin(r), 0],
    [0, Math.sin(r), Math.cos(r), 0],
    [0, 0, 0, 1],
  ];
};

const rotateYMatrix = (r: number): Matrix4 => {
  "worklet";
  return [
    [Math.cos(r), 0, Math.sin(r), 0],
    [0, 1, 0, 0],
    [-Math.sin(r), 0, Math.cos(r), 0],
    [0, 0, 0, 1],
  ];
};

const rotateZMatrix = (r: number): Matrix4 => {
  "worklet";
  return [
    [Math.cos(r), -Math.sin(r), 0, 0],
    [Math.sin(r), Math.cos(r), 0, 0],
    [0, 0, 1, 0],
    [0, 0, 0, 1],
  ];
};

/**
 * @worklet
 */
export const dot4 = (row: Vec4, col: Vec4) => {
  "worklet";
  return row[0] * col[0] + row[1] * col[1] + row[2] * col[2] + row[3] * col[3];
};

/**
 * @worklet
 */
export const matrixVecMul4 = (m: Matrix4, v: Vec4) => {
  "worklet";
  return [dot4(m[0], v), dot4(m[1], v), dot4(m[2], v), dot4(m[3], v)] as const;
};

/**
 * @worklet
 */
export const multiply4 = (m1: Matrix4, m2: Matrix4) => {
  "worklet";
  const col0 = [m2[0][0], m2[1][0], m2[2][0], m2[3][0]] as const;
  const col1 = [m2[0][1], m2[1][1], m2[2][1], m2[3][1]] as const;
  const col2 = [m2[0][2], m2[1][2], m2[2][2], m2[3][2]] as const;
  const col3 = [m2[0][3], m2[1][3], m2[2][3], m2[3][3]] as const;
  return [
    [
      dot4(m1[0], col0),
      dot4(m1[0], col1),
      dot4(m1[0], col2),
      dot4(m1[0], col3),
    ],
    [
      dot4(m1[1], col0),
      dot4(m1[1], col1),
      dot4(m1[1], col2),
      dot4(m1[1], col3),
    ],
    [
      dot4(m1[2], col0),
      dot4(m1[2], col1),
      dot4(m1[2], col2),
      dot4(m1[2], col3),
    ],
    [
      dot4(m1[3], col0),
      dot4(m1[3], col1),
      dot4(m1[3], col2),
      dot4(m1[3], col3),
    ],
  ] as const;
};

/**
 * @worklet
 */
export const processTransform3d = (transforms: Transforms3d) => {
  "worklet";
  return transforms.reduce((acc, transform) => {
    const key = Object.keys(transform)[0] as Transform3dName;
    if (key === "translateX") {
      const value = (transform as Pick<Transformations, typeof key>)[key];
      return multiply4(acc, translateXMatrix(value));
    }
    if (key === "translateY") {
      const value = (transform as Pick<Transformations, typeof key>)[key];
      return multiply4(acc, translateYMatrix(value));
    }
    if (key === "translateZ") {
      const value = (transform as Pick<Transformations, typeof key>)[key];
      return multiply4(acc, translateZMatrix(value));
    }
    if (key === "scale") {
      const value = (transform as Pick<Transformations, typeof key>)[key];
      return multiply4(acc, scaleMatrix(value));
    }
    if (key === "scaleX") {
      const value = (transform as Pick<Transformations, typeof key>)[key];
      return multiply4(acc, scaleXMatrix(value));
    }
    if (key === "scaleY") {
      const value = (transform as Pick<Transformations, typeof key>)[key];
      return multiply4(acc, scaleYMatrix(value));
    }
    if (key === "skewX") {
      const value = (transform as Pick<Transformations, typeof key>)[key];
      return multiply4(acc, skewXMatrix(value));
    }
    if (key === "skewY") {
      const value = (transform as Pick<Transformations, typeof key>)[key];
      return multiply4(acc, skewYMatrix(value));
    }
    if (key === "rotateX") {
      const value = (transform as Pick<Transformations, typeof key>)[key];
      return multiply4(acc, rotateXMatrix(value));
    }
    if (key === "rotateY") {
      const value = (transform as Pick<Transformations, typeof key>)[key];
      return multiply4(acc, rotateYMatrix(value));
    }
    if (key === "perspective") {
      const value = (transform as Pick<Transformations, typeof key>)[key];
      return multiply4(acc, perspectiveMatrix(value));
    }
    if (key === "rotate" || key === "rotateZ") {
      const value = (transform as Pick<Transformations, typeof key>)[key];
      return multiply4(acc, rotateZMatrix(value));
    }
    if (key === "matrix") {
      const matrix = (transform as Pick<Transformations, typeof key>)[key];
      return multiply4(acc, matrix);
    }
    return exhaustiveCheck(key);
  }, identityMatrix4);
};
