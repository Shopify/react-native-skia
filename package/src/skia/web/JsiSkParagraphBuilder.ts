import type { CanvasKit, ParagraphBuilder } from "canvaskit-wasm";

import type { SkParagraphBuilder, SkParagraph, SkTextStyle } from "../types";
import { PlaceholderAlignment, TextBaseline } from "../types";

import { HostObject } from "./Host";
import { JsiSkParagraph } from "./JsiSkParagraph";
import { JsiSkTextStyle } from "./JsiSkTextStyle";

export class JsiSkParagraphBuilder
  extends HostObject<ParagraphBuilder, "ParagraphBuilder">
  implements SkParagraphBuilder
{
  constructor(CanvasKit: CanvasKit, ref: ParagraphBuilder) {
    super(CanvasKit, ref, "ParagraphBuilder");
  }
  addPlaceholder(
    width: number | undefined = 0,
    height: number | undefined = 0,
    alignment: PlaceholderAlignment | undefined = PlaceholderAlignment.Baseline,
    baseline: TextBaseline | undefined = TextBaseline.Alphabetic,
    offset: number | undefined = 0
  ): SkParagraphBuilder {
    this.ref.addPlaceholder(
      width,
      height,
      { value: alignment },
      { value: baseline },
      offset
    );
    return this;
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
