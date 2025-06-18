export class JsiSkPictureRecorder extends HostObject {
    constructor(CanvasKit: any, ref: any);
    beginRecording(bounds: any): JsiSkCanvas;
    finishRecordingAsPicture(): JsiSkPicture;
}
import { HostObject } from "./Host";
import { JsiSkCanvas } from "./JsiSkCanvas";
import { JsiSkPicture } from "./JsiSkPicture";
