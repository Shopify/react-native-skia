import type { CanvasKit } from "canvaskit-wasm";
import type { SkFont } from "../types";
import type { TextBlobFactory } from "../types/TextBlob";
import type { SkRSXform } from "../types/RSXform";
import { Host } from "./Host";
import { JsiSkTextBlob } from "./JsiSkTextBlob";
export declare class JsiSkTextBlobFactory extends Host implements TextBlobFactory {
    constructor(CanvasKit: CanvasKit);
    MakeFromText(str: string, font: SkFont): JsiSkTextBlob;
    MakeFromGlyphs(glyphs: number[], font: SkFont): JsiSkTextBlob;
    MakeFromRSXform(str: string, rsxforms: SkRSXform[], font: SkFont): JsiSkTextBlob;
    MakeFromRSXformGlyphs(glyphs: number[], rsxforms: SkRSXform[], font: SkFont): JsiSkTextBlob;
}
