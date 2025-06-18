export class JsiSkRRect extends BaseHostObject {
    static fromValue(CanvasKit: any, rect: any): any;
    constructor(CanvasKit: any, rect: any, rx: any, ry: any);
    get rx(): any;
    get ry(): any;
    get rect(): JsiSkRect;
}
import { BaseHostObject } from "./Host";
import { JsiSkRect } from "./JsiSkRect";
