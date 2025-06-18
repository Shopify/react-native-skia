import type { CanvasKit, PictureRecorder } from "canvaskit-wasm";
import type { SkRect } from "../types";
import type { SkPictureRecorder } from "../types/Picture/PictureRecorder";
import { HostObject } from "./Host";
import { JsiSkCanvas } from "./JsiSkCanvas";
import { JsiSkPicture } from "./JsiSkPicture";
export declare class JsiSkPictureRecorder extends HostObject<PictureRecorder, "PictureRecorder"> implements SkPictureRecorder {
    constructor(CanvasKit: CanvasKit, ref: PictureRecorder);
    dispose: () => void;
    beginRecording(bounds?: SkRect): JsiSkCanvas;
    finishRecordingAsPicture(): JsiSkPicture;
}
