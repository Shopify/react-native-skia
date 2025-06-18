export class JsiSkParagraphBuilder extends HostObject {
    constructor(CanvasKit: any, ref: any);
    addPlaceholder(width?: number, height?: number, alignment?: any, baseline?: any, offset?: number): this;
    addText(text: any): this;
    build(): JsiSkParagraph;
    reset(): void;
    pushStyle(style: any, foregroundPaint: any, backgroundPaint: any): this;
    pop(): this;
    dispose(): void;
    makePaint(color: any): any;
}
import { HostObject } from "./Host";
import { JsiSkParagraph } from "./JsiSkParagraph";
