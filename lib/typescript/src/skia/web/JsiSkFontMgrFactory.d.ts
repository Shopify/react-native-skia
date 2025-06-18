import type { CanvasKit } from "canvaskit-wasm";
import type { FontMgrFactory } from "../types";
import { Host } from "./Host";
import { JsiSkFontMgr } from "./JsiSkFontMgr";
export declare class JsiSkFontMgrFactory extends Host implements FontMgrFactory {
    constructor(CanvasKit: CanvasKit);
    System(): JsiSkFontMgr;
}
