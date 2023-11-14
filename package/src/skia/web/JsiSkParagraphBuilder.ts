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
  SkParagraphStyle,
  SkPaint,
} from "../types";
import { PlaceholderAlignment, TextBaseline } from "../types";
import { E2E } from "../../__tests__/setup";

import { HostObject } from "./Host";
import type { ParagraphNode } from "./JsiSkParagraph";
import { JsiSkParagraph } from "./JsiSkParagraph";
import { JsiSkTextStyle } from "./JsiSkTextStyle";
import { JsiSkPaint } from "./JsiSkPaint";

export class JsiSkParagraphBuilder
  extends HostObject<ParagraphBuilder, "ParagraphBuilder">
  implements SkParagraphBuilder
{
  elements: Array<ParagraphNode>;

  constructor(
    CanvasKit: CanvasKit,
    ref: ParagraphBuilder,
    private style?: SkParagraphStyle
  ) {
    super(CanvasKit, ref, "ParagraphBuilder");
    this.elements = [];
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
    if (E2E) {
      this.elements.push({
        type: "placeholder",
        width,
        height,
        alignment,
        baseline,
        offset,
      });
    }
    return this;
  }
  addText(text: string): SkParagraphBuilder {
    if (E2E) {
      this.elements.push({
        type: "text",
        text,
      });
    }

    this.ref.addText(text);
    return this;
  }

  build(): SkParagraph {
    return new JsiSkParagraph(
      this.CanvasKit,
      this.ref.build(),
      this.elements,
      this.style
    );
  }

  reset(): void {
    if (E2E) {
      this.elements = [];
    }

    this.ref.reset();
  }

  pushStyle(
    style: SkTextStyle,
    foregroundPaint?: SkPaint | undefined,
    backgroundPaint?: SkPaint | undefined
  ): SkParagraphBuilder {
    if (E2E) {
      this.elements.push({
        type: "push_style",
        style,
      });
    }

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
    if (E2E) {
      this.elements.push({ type: "pop_style" });
    }

    this.ref.pop();
    return this;
  }

  dispose() {
    this.ref.delete();
  }
}
