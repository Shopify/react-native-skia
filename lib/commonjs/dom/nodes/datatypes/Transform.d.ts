import type { TransformProps } from "../../types";
import type { Skia, SkMatrix } from "../../../skia/types";
export declare const processTransformProps: (m3: SkMatrix, props: TransformProps) => void;
export declare const processTransformProps2: (Skia: Skia, props: TransformProps) => SkMatrix | null;
