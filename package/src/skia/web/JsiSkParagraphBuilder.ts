import type { CanvasKit, ParagraphBuilder } from "canvaskit-wasm";
import type {
  SkParagraphBuilder,
  SkParagraph,
  SkTextStyle,
  PlaceholderAlignment,
  TextBaseline,
} from "../types";

import { HostObject } from "./Host";

import {JsiSkParagraph} from './JsiSkParagraph'
import {JsiSkTextStyle} from './JsiSkTextStyle'

export class JsiSkParagraphBuilder
  extends HostObject<ParagraphBuilder, "ParagraphBuilder">
  implements SkParagraphBuilder
{
  constructor(CanvasKit: CanvasKit, ref: ParagraphBuilder) {
    super(CanvasKit, ref, "ParagraphBuilder");
  }
  addPlaceholder(
    width?: number | undefined,
    height?: number | undefined,
    alignment?: PlaceholderAlignment | undefined,
    baseline?: TextBaseline | undefined,
    offset?: number | undefined
  ): void {
    this.ref.addPlaceholder(
      width,
      height,
      alignment ? { value: alignment } : undefined,
      baseline ? { value: baseline } : undefined,
      offset
    );
  }
  build(): SkParagraph {
    return new JsiSkParagraph(this.CanvasKit, this.ref.build());
  }
  reset(): void {
    this.ref.reset();
  }
  pushStyle(style: SkTextStyle): SkParagraphBuilder {
    this.ref.pushStyle(JsiSkTextStyle.fromValue(style));
    return this;
  }
  pop(): SkParagraphBuilder {
    this.ref.pop();
    return this;
  }
  addText(text: string): SkParagraphBuilder {
    this.ref.addText(text);
    return this;
  }
  dispose() {
    this.ref.delete();
  }
}
