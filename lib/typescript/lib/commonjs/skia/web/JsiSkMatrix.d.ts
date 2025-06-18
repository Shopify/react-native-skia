export const __esModule: boolean;
export class JsiSkMatrix extends _Host.HostObject {
    constructor(CanvasKit: any, ref: any);
    preMultiply(matrix: any): void;
    postMultiply(matrix: any): void;
    concat(matrix: any): this;
    translate(x: any, y: any): this;
    postTranslate(x: any, y: any): this;
    scale(x: any, y: any): this;
    postScale(x: any, y: any): this;
    skew(x: any, y: any): this;
    postSkew(x: any, y: any): this;
    rotate(value: any): this;
    postRotate(value: any): this;
    identity(): this;
    get(): any[];
}
import _Host = require("./Host");
