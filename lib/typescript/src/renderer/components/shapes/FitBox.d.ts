import type { ReactNode } from "react";
import React from "react";
import type { Fit } from "../../../dom/nodes";
import type { SkRect, Transforms3d } from "../../../skia/types";
interface FitProps {
    fit?: Fit;
    src: SkRect;
    dst: SkRect;
    children: ReactNode | ReactNode[];
}
export declare const fitbox: (fit: Fit, src: SkRect, dst: SkRect, rotation?: 0 | 90 | 180 | 270) => Transforms3d;
export declare const FitBox: ({ fit, src, dst, children }: FitProps) => React.JSX.Element;
export {};
