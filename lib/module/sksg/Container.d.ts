import type { Skia, SkCanvas } from "../skia/types";
import type { Node } from "./Node";
import type { Recording } from "./Recorder/Recorder";
import "../views/api";
export declare abstract class Container {
    protected Skia: Skia;
    protected nativeId: number;
    root: Node[];
    protected recording: Recording | null;
    protected unmounted: boolean;
    constructor(Skia: Skia, nativeId: number);
    unmount(): void;
    drawOnCanvas(canvas: SkCanvas): void;
    abstract redraw(): void;
}
declare class StaticContainer extends Container {
    constructor(Skia: Skia, nativeId: number);
    redraw(): void;
}
declare class ReanimatedContainer extends Container {
    private mapperId;
    constructor(Skia: Skia, nativeId: number);
    redraw(): void;
}
declare class NativeReanimatedContainer extends Container {
    private mapperId;
    constructor(Skia: Skia, nativeId: number);
    redraw(): void;
}
export declare const createContainer: (Skia: Skia, nativeId: number) => StaticContainer | ReanimatedContainer | NativeReanimatedContainer;
export {};
