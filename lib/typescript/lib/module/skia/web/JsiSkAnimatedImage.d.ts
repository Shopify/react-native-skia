export class JsiSkAnimatedImage extends HostObject {
    constructor(CanvasKit: any, ref: any);
    decodeNextFrame(): any;
    currentFrameDuration(): any;
    getFrameCount(): any;
    getCurrentFrame(): JsiSkImage | null;
}
import { HostObject } from "./Host";
import { JsiSkImage } from "./JsiSkImage";
