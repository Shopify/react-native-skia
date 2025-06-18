import type { CanvasKit, SkPicture as Picture } from "canvaskit-wasm";
import type { FilterMode, SkRect, TileMode, SkPicture, SkMatrix } from "../types";
import { HostObject } from "./Host";
import { JsiSkShader } from "./JsiSkShader";
export declare class JsiSkPicture extends HostObject<Picture, "Picture"> implements SkPicture {
    constructor(CanvasKit: CanvasKit, ref: Picture);
    dispose: () => void;
    makeShader(tmx: TileMode, tmy: TileMode, mode: FilterMode, localMatrix?: SkMatrix, tileRect?: SkRect): JsiSkShader;
    serialize(): Uint8Array<ArrayBufferLike> | null;
}
