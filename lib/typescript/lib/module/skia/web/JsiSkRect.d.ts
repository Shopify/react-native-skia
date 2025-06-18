export class JsiSkRect extends BaseHostObject {
    static fromValue(CanvasKit: any, rect: any): any;
    constructor(CanvasKit: any, ref: any);
    setXYWH(x: any, y: any, width: any, height: any): void;
    get x(): any;
    get y(): any;
    get width(): number;
    get height(): number;
}
import { BaseHostObject } from "./Host";
