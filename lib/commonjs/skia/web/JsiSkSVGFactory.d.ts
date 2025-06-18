import type { CanvasKit } from "canvaskit-wasm";
import type { SkSVG } from "../types";
import type { SVGFactory } from "../types/SVG/SVGFactory";
import { Host } from "./Host";
import type { JsiSkData } from "./JsiSkData";
export declare class JsiSkSVGFactory extends Host implements SVGFactory {
    constructor(CanvasKit: CanvasKit);
    MakeFromData(data: JsiSkData): SkSVG | null;
    MakeFromString(str: string): SkSVG | null;
}
