export const __esModule: boolean;
export class JsiSkParagraphBuilder extends _Host.HostObject {
    constructor(CanvasKit: any, ref: any);
    addPlaceholder(width?: number, height?: number, alignment?: any, baseline?: any, offset?: number): this;
    addText(text: any): this;
    build(): _JsiSkParagraph.JsiSkParagraph;
    reset(): void;
    pushStyle(style: any, foregroundPaint: any, backgroundPaint: any): this;
    pop(): this;
    dispose(): void;
    makePaint(color: any): any;
}
import _Host = require("./Host");
import _JsiSkParagraph = require("./JsiSkParagraph");
