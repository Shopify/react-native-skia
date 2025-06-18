import type { CanvasKit, Vertices } from "canvaskit-wasm";
import type { SkVertices } from "../types";
import { HostObject } from "./Host";
import { JsiSkRect } from "./JsiSkRect";
export declare class JsiSkVertices extends HostObject<Vertices, "Vertices"> implements SkVertices {
    constructor(CanvasKit: CanvasKit, ref: Vertices);
    dispose: () => void;
    bounds(): JsiSkRect;
    uniqueID(): number;
}
