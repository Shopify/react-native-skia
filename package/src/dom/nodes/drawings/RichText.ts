import {
  TextAlign,
  TextDirection,
  TextHeightBehavior,
  DecorationStyle,
  FontStyle,
  TextBaseline,
} from "../../../skia/types";
import type { ParagraphStyle, Skia, TextStyle } from "../../../skia/types";
import type {
  DeclarationContext,
  DrawingContext,
  RenderNode,
  RichTextProps,
  SpanProps,
  TextStyleProps,
} from "../../types";
import { DeclarationType, NodeType } from "../../types";
import type { NodeContext } from "../Node";
import { JsiNode, JsiDeclarationNode } from "../Node";
import { enumKey } from "../datatypes";

const addTextStyleProp = <K extends keyof TextStyle>(
  style: TextStyle,
  name: K,
  value: TextStyle[K]
) => {
  if (value !== undefined) {
    style[name] = value;
  }
};

const textStyleFromProps = (Skia: Skia, props: TextStyleProps) => {
  const {
    decoration,
    decorationThickness,
    fontFamilies,
    fontFeatures,
    fontSize,
    fontVariations,
    heightMultiplier,
    halfLeading,
    letterSpacing,
    locale,
    shadows,
    wordSpacing,
    backgroundColor,
    color,
    decorationColor,
    foregroundColor,
    decorationStyle,
    fontStyle,
    textBaseline,
  } = props;
  const style: TextStyle = {};
  addTextStyleProp(style, "decoration", decoration);
  addTextStyleProp(style, "decorationThickness", decorationThickness);
  addTextStyleProp(style, "fontFamilies", fontFamilies);
  addTextStyleProp(style, "fontFeatures", fontFeatures);
  addTextStyleProp(style, "fontSize", fontSize);
  addTextStyleProp(style, "fontVariations", fontVariations);
  addTextStyleProp(style, "heightMultiplier", heightMultiplier);
  addTextStyleProp(style, "halfLeading", halfLeading);
  addTextStyleProp(style, "letterSpacing", letterSpacing);
  addTextStyleProp(style, "locale", locale);
  addTextStyleProp(style, "shadows", shadows);
  addTextStyleProp(style, "wordSpacing", wordSpacing);
  if (backgroundColor !== undefined) {
    style.backgroundColor = Skia.Color(backgroundColor);
  }
  if (color !== undefined) {
    style.color = Skia.Color(color);
  }
  if (decorationColor !== undefined) {
    style.decorationColor = Skia.Color(decorationColor);
  }
  if (foregroundColor !== undefined) {
    style.foregroundColor = Skia.Color(foregroundColor);
  }
  if (decorationStyle !== undefined) {
    style.decorationStyle = DecorationStyle[enumKey(decorationStyle)];
  }
  if (fontStyle !== undefined) {
    style.fontStyle = FontStyle[enumKey(fontStyle)];
  }
  if (textBaseline !== undefined) {
    style.textBaseline = TextBaseline[enumKey(textBaseline)];
  }
  return style;
};

export class RichTextNode
  extends JsiNode<RichTextProps>
  implements RenderNode<RichTextProps>
{
  constructor(ctx: NodeContext, props: RichTextProps) {
    super(ctx, NodeType.RichText, props);
  }

  render(ctx: DrawingContext): void {
    const { canvas } = ctx;
    const style = this.getStyle();
    const { x, y, width } = this.props;
    ctx.declarationCtx.paragraphBuilder =
      this.Skia.ParagraphBuilder.MakeFromFontProvider(
        style,
        ctx.typefaceProvider
      );
    this.children().forEach((child) => {
      if (child instanceof JsiDeclarationNode) {
        child.decorate(ctx.declarationCtx);
      }
    });
    const paragraph = ctx.declarationCtx.paragraphBuilder!.build();
    paragraph.layout(width);
    canvas.drawParagraph(paragraph, x, y);
  }

  protected getStyle() {
    const {
      disableHinting,
      ellipsis,
      heightMultiplier,
      maxLines,
      strutStyle,
      textAlign,
      textDirection,
      textHeightBehavior,
    } = this.props;
    const style: ParagraphStyle = {
      disableHinting,
      ellipsis,
      heightMultiplier,
      maxLines,
      strutStyle,
      textStyle: textStyleFromProps(this.Skia, this.props),
    };
    if (textAlign !== undefined) {
      style.textAlign = TextAlign[enumKey(textAlign)];
    }
    if (textDirection !== undefined) {
      style.textDirection = TextDirection[enumKey(textDirection)];
    }
    if (textHeightBehavior !== undefined) {
      style.textHeightBehavior =
        TextHeightBehavior[enumKey(textHeightBehavior)];
    }

    return style;
  }
}

export class SpanNode extends JsiDeclarationNode<SpanProps> {
  constructor(ctx: NodeContext, props: SpanProps) {
    super(ctx, DeclarationType.Span, NodeType.Span, props);
  }

  decorate(ctx: DeclarationContext) {
    const {
      text,
      foregroundPaint: fg,
      backgroundPaint: bg,
      ...rawStyle
    } = this.props;
    const builder = ctx.paragraphBuilder;
    if (!builder) {
      throw new Error("SpanNode: paragraph builder is undefined");
    }
    const style = textStyleFromProps(this.Skia, rawStyle);
    const shouldSavePaint = fg !== undefined || bg !== undefined;
    const shouldSave = shouldSavePaint || style !== undefined;
    if (shouldSave) {
      if (shouldSavePaint) {
        // TODO: one of the two paint might be undefined
        // TODO: is this using also the color or can it be a shader too?
        builder.pushPaintStyle(style, fg!, bg!);
      } else {
        builder.pushStyle(style);
      }
    }
    if (text) {
      builder.addText(text);
    } else {
      this.decorateChildren(ctx);
    }
    if (shouldSave) {
      builder.pop();
    }
  }
}
