export const __esModule: boolean;
/**
 * @worklet
 */
export function Matrix4(): number[];
export function translate(x: any, y: any, z?: number): any[];
export function perspective(p: any): number[];
/**
 * @worklet
 */
export function matrixVecMul4(m: any, v: any): number[];
export function mapPoint3d(m: any, v: any): number[];
export function multiply4(a: any, b: any): any[];
/**
 * @worklet
 */
export function toMatrix3(m: any): any[];
/**
 * @worklet
 */
export function pivot(m: any, p: any): any[];
export function scale(sx: any, sy: any, sz: number | undefined, p: any): any[];
/**
 * @worklet
 */
export function rotateZ(value: any, p: any): any[];
export function rotateX(value: any, p: any): any[];
export function rotateY(value: any, p: any): any[];
export function processTransform3d(transforms: any): any;
export function convertToColumnMajor(rowMajorMatrix: any): any[];
export function convertToAffineMatrix(m4: any): any[];
/**
 * Inverts a 4x4 matrix
 * @worklet
 * @returns The inverted matrix, or the identity matrix if the input is not invertible
 */
export function invert4(m: any): number[];
