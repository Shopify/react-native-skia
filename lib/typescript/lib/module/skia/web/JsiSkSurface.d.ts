export class JsiSkSurface extends HostObject {
    constructor(CanvasKit: any, ref: any);
    flush(): void;
    width(): any;
    height(): any;
    getCanvas(): JsiSkCanvas;
    makeImageSnapshot(bounds: any): JsiSkImage;
    getNativeTextureUnstable(): null;
}
import { HostObject } from "./Host";
import { JsiSkCanvas } from "./JsiSkCanvas";
import { JsiSkImage } from "./JsiSkImage";
