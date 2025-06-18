type Point = {
    x: number;
    y: number;
};
type Vec2 = readonly [number, number];
type Vec3 = readonly [number, number, number];
type Vec4 = readonly [number, number, number, number];
export type Matrix3 = readonly [
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
type Transform3dName = "translateX" | "translateY" | "translateZ" | "translate" | "scale" | "scaleX" | "scaleY" | "skewX" | "skewY" | "rotateZ" | "rotate" | "perspective" | "rotateX" | "rotateY" | "matrix";
type Transformations = {
    [Name in Transform3dName]: Name extends "matrix" ? Matrix4 : Name extends "translate" ? Vec3 | Vec2 : number;
};
type Transform3d = Pick<Transformations, "translateX"> | Pick<Transformations, "translateY"> | Pick<Transformations, "translateZ"> | Pick<Transformations, "translate"> | Pick<Transformations, "scale"> | Pick<Transformations, "scaleX"> | Pick<Transformations, "scaleY"> | Pick<Transformations, "skewX"> | Pick<Transformations, "skewY"> | Pick<Transformations, "perspective"> | Pick<Transformations, "rotateX"> | Pick<Transformations, "rotateY"> | Pick<Transformations, "rotateZ"> | Pick<Transformations, "rotate"> | Pick<Transformations, "matrix">;
export type Transforms3d = Transform3d[];
/**
 * @worklet
 */
export declare const Matrix4: () => Matrix4;
/**
 * @worklet
 */
export declare const translate: (x: number, y: number, z?: number) => Matrix4;
/**
 * @worklet
 */
export declare const perspective: (p: number) => Matrix4;
/**
 * @worklet
 */
export declare const matrixVecMul4: (m: Matrix4, v: Vec4) => Vec4;
/**
 * @worklet
 */
export declare const mapPoint3d: (m: Matrix4, v: Vec3) => readonly [number, number, number];
/**
 * @worklet
 */
export declare const multiply4: (a: Matrix4, b: Matrix4) => Matrix4;
/**
 * @worklet
 */
export declare const toMatrix3: (m: Matrix4) => number[];
/**
 * @worklet
 */
export declare const pivot: (m: Matrix4, p: Point) => Matrix4;
/**
 * @worklet
 */
export declare const scale: (sx: number, sy: number, sz?: number, p?: Point) => Matrix4;
/**
 * @worklet
 */
export declare const rotateZ: (value: number, p?: Point) => Matrix4;
/**
 * @worklet
 */
export declare const rotateX: (value: number, p?: Point) => Matrix4;
/**
 * @worklet
 */
export declare const rotateY: (value: number, p?: Point) => Matrix4;
/**
 * @worklet
 */
export declare const processTransform3d: (transforms: Transforms3d) => Matrix4;
/**
 * @worklet
 */
export declare const convertToColumnMajor: (rowMajorMatrix: Matrix4) => Matrix4;
/**
 * @worklet
 */
export declare const convertToAffineMatrix: (m4: Matrix4) => number[];
/**
 * Inverts a 4x4 matrix
 * @worklet
 * @returns The inverted matrix, or the identity matrix if the input is not invertible
 */
export declare const invert4: (m: Matrix4) => Matrix4;
export {};
