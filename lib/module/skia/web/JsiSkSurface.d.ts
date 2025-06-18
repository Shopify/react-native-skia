import type { CanvasKit, Surface } from "canvaskit-wasm";
import type { SkCanvas, SkImage, SkRect, SkSurface } from "../types";
import { HostObject } from "./Host";
export declare class JsiSkSurface extends HostObject<Surface, "Surface"> implements SkSurface {
    constructor(CanvasKit: CanvasKit, ref: Surface);
    dispose: () => void;
    flush(): void;
    width(): number;
    height(): number;
    getCanvas(): SkCanvas;
    makeImageSnapshot(bounds?: SkRect): SkImage;
    getNativeTextureUnstable(): unknown;
}
