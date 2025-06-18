import type { DrawingNodeProps } from "../../dom/types";
import type { BaseRecorder } from "../../skia/types/Recorder";
import type { Node } from "../Node";
export declare const processPaint: ({ opacity, color, strokeWidth, blendMode, style, strokeJoin, strokeCap, strokeMiter, antiAlias, dither, paint: paintRef, }: DrawingNodeProps) => DrawingNodeProps | null;
export declare const visit: (recorder: BaseRecorder, root: Node[]) => void;
