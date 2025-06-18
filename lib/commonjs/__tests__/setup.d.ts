import type { SkSurface, SkImage } from "../skia/types";
export declare const E2E: boolean;
export declare const CI: boolean;
export declare const itFailsE2e: jest.It;
export declare const itRunsE2eOnly: jest.It;
export declare const itRunsNodeOnly: jest.It;
export declare const itRunsCIAndNodeOnly: jest.It;
export declare const docPath: (relPath: string) => string;
export declare const processResult: (surface: SkSurface, relPath: string, overwrite?: boolean) => number;
interface CheckImageOptions {
    maxPixelDiff?: number;
    threshold?: number;
    overwrite?: boolean;
    mute?: boolean;
    shouldFail?: boolean;
}
export declare const checkImage: (image: SkImage, relPath: string, opts?: CheckImageOptions) => number;
declare global {
    namespace jest {
        interface Matchers<R> {
            /**
             * Checks if values are approximately equal within the given tolerance.
             * Works with:
             * - Single numbers
             * - Arrays of numbers
             * - Float32Arrays
             * - SVG path strings (compares numeric values with tolerance)
             *
             * @param expected - The expected value to compare against
             * @param tolerance - The maximum allowed difference between elements (default: 0.01)
             */
            toBeApproximatelyEqual(expected: number | number[] | Float32Array | string, tolerance?: number): R;
        }
    }
}
export {};
