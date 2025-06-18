import type { ReactNode } from "react";
import type { SkSurface } from "../skia";
export * from "../renderer/components";
export * from "../skia/types";
export declare const makeOffscreenSurface: (width: number, height: number) => SkSurface;
export declare const getSkiaExports: () => {
    Skia: import("../skia/types").Skia;
};
export declare const drawOffscreen: (surface: SkSurface, element: ReactNode) => import("../skia").SkImage;
