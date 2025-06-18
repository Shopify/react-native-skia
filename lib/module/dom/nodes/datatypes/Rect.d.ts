import type { Skia, SkRect, SkRRect, Vector } from "../../../skia/types";
import type { RectDef, RRectDef } from "../../types";
export declare const isEdge: (pos: Vector, b: SkRect) => boolean;
export declare const processRect: (Skia: Skia, def: RectDef) => SkRect;
export declare const processRRect: (Skia: Skia, def: RRectDef) => import("../../../skia/types").InputRRect;
export declare const inflate: (Skia: Skia, box: SkRRect, dx: number, dy: number, tx?: number, ty?: number) => SkRRect;
export declare const deflate: (Skia: Skia, box: SkRRect, dx: number, dy: number, tx?: number, ty?: number) => SkRRect;
