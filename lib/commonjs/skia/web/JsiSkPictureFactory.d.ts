import type { CanvasKit } from "canvaskit-wasm";
import type { PictureFactory } from "../types";
import { Host } from "./Host";
import { JsiSkPicture } from "./JsiSkPicture";
export declare class JsiSkPictureFactory extends Host implements PictureFactory {
    constructor(CanvasKit: CanvasKit);
    MakePicture(bytes: Uint8Array | ArrayBuffer): JsiSkPicture | null;
}
