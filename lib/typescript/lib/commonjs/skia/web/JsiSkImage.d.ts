export const __esModule: boolean;
export function toBase64String(bytes: any): string;
export class JsiSkImage extends _Host.HostObject {
    constructor(CanvasKit: any, ref: any);
    height(): any;
    width(): any;
    getImageInfo(): {
        width: any;
        height: any;
        colorType: any;
        alphaType: any;
    };
    makeShaderOptions(tx: any, ty: any, fm: any, mm: any, localMatrix: any): _JsiSkShader.JsiSkShader;
    makeShaderCubic(tx: any, ty: any, B: any, C: any, localMatrix: any): _JsiSkShader.JsiSkShader;
    encodeToBytes(fmt: any, quality: any): any;
    encodeToBase64(fmt: any, quality: any): string;
    readPixels(srcX: any, srcY: any, imageInfo: any): any;
    makeNonTextureImage(): JsiSkImage;
    getNativeTextureUnstable(): null;
}
import _Host = require("./Host");
import _JsiSkShader = require("./JsiSkShader");
