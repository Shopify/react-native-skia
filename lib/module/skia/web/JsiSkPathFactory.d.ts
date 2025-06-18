import type { CanvasKit } from "canvaskit-wasm";
import type { PathCommand, PathOp, SkFont, SkPath } from "../types";
import type { PathFactory } from "../types/Path/PathFactory";
import { Host } from "./Host";
import { JsiSkPath } from "./JsiSkPath";
export declare class JsiSkPathFactory extends Host implements PathFactory {
    constructor(CanvasKit: CanvasKit);
    Make(): JsiSkPath;
    MakeFromSVGString(str: string): JsiSkPath | null;
    MakeFromOp(one: SkPath, two: SkPath, op: PathOp): JsiSkPath | null;
    MakeFromCmds(cmds: PathCommand[]): JsiSkPath | null;
    MakeFromText(_text: string, _x: number, _y: number, _font: SkFont): SkPath;
}
