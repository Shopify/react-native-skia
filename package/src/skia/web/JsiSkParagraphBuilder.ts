import type {
  CanvasKit,
  Paint,
  ParagraphBuilder,
  TextStyle,
} from "canvaskit-wasm";

import type {
  SkParagraphBuilder,
  SkParagraph,
  SkTextStyle,
  SkPaint,
} from "../types";
import { PlaceholderAlignment, TextBaseline } from "../types";

import { HostObject } from "./Host";
import { JsiSkParagraph } from "./JsiSkParagraph";
import { JsiSkTextStyle } from "./JsiSkTextStyle";
import { JsiSkPaint } from "./JsiSkPaint";

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
  addText(text: string): SkParagraphBuilder {
    this.ref.addText(text);
    return this;
  }

  build(): SkParagraph {
    return new JsiSkParagraph(this.CanvasKit, this.ref.build());
  }

  reset(): void {
    this.ref.reset();
  }

  pushStyle(
    style: SkTextStyle,
    foregroundPaint?: SkPaint | undefined,
    backgroundPaint?: SkPaint | undefined
  ): SkParagraphBuilder {
    const textStyle: TextStyle = JsiSkTextStyle.toTextStyle(style);
    if (foregroundPaint || backgroundPaint) {
      const fg: Paint = foregroundPaint
        ? JsiSkPaint.fromValue(foregroundPaint)
        : new this.CanvasKit.Paint();
      const bg: Paint = backgroundPaint
        ? JsiSkPaint.fromValue(backgroundPaint)
        : new this.CanvasKit.Paint();
      this.ref.pushPaintStyle(new this.CanvasKit.TextStyle(textStyle), fg, bg);
    } else {
      this.ref.pushStyle(new this.CanvasKit.TextStyle(textStyle));
    }

    return this;
  }

  pop(): SkParagraphBuilder {
    this.ref.pop();
    return this;
  }

  dispose() {
    this.ref.delete();
  }
}
