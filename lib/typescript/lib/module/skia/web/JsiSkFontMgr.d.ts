export class JsiSkFontMgr extends HostObject {
    constructor(CanvasKit: any, ref: any);
    dispose(): void;
    countFamilies(): any;
    getFamilyName(index: any): any;
    matchFamilyStyle(_familyName: any, _fontStyle: any): jest.Mock<any, any, any>;
}
import { HostObject } from "./Host";
