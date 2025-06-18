import type { Skia } from "../../../skia/types";
import type { PathDef } from "../../types";
export declare const processPath: (Skia: Skia, rawPath: PathDef) => import("../../../skia/types").SkPath;
export declare const isPathDef: (def: any) => def is PathDef;
