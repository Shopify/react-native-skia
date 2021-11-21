import type {
  CanvasKit,
  FontMgr,
  Paint,
  ParagraphBuilder,
  TextStyle as ITextStyle,
} from "canvaskit-wasm";
import type { ReactNode } from "react";

import type { DrawingContext } from "../../CanvasKitView";
import { NodeType, processChildren } from "../../Host";
import type { SkNode } from "../../Host";
import { useFontManager } from "../../../elements/AssetManager";
import type { CustomPaintProps } from "../processors";
import { selectPaint, processPaint } from "../processors/Paint";

import type { TextStyle, ParagraphStyle } from "./TextStyle";
import { textStyle, paragraphStyle } from "./TextStyle";

type Token = {
  style: TextStyle & CustomPaintProps;
  text: string;
  children: Token[];
};

const processTokens = (
  CanvasKit: CanvasKit,
  builder: ParagraphBuilder,
  tokens: Token[],
  fg: Paint,
  bg: Paint,
  baseStyle: ITextStyle
) => {
  tokens.forEach((token) => {
    const paint = selectPaint(fg, token.style);
    processPaint(CanvasKit, paint, 1, token.style);
    const tokenStyle = textStyle(CanvasKit, token.style);
    const style = {
      ...baseStyle,
      ...tokenStyle,
    };
    builder.pushPaintStyle(new CanvasKit.TextStyle(style), paint, bg);
    if (token.text) {
      builder.addText(token.text);
    } else if (token.children) {
      processTokens(CanvasKit, builder, token.children, paint, bg, style);
    }
    builder.pop();
  });
};

export interface UnresolvedTextProps extends ParagraphStyle, TextStyle {
  x: number;
  y: number;
  width: number;
  onLayout?: (layout: { height: number }) => void;
  children?: ReactNode;
}

export const Text = (props: UnresolvedTextProps) => {
  const fontMgr = useFontManager();
  return <skText fontMgr={fontMgr} {...props} />;
};

export interface TextProps extends UnresolvedTextProps {
  fontMgr: FontMgr;
}

export const TextNode = (props: TextProps): SkNode<NodeType.Text> => ({
  type: NodeType.Text,
  props,
  draw: (
    ctx: DrawingContext,
    { x, y, width, fontMgr, onLayout, children: child, ...textProps },
    children
  ) => {
    const { CanvasKit, canvas, paint } = ctx;
    const nodes = processChildren(ctx, children) as Token[];
    const fg = selectPaint(paint, textProps);
    processPaint(CanvasKit, fg, 1, textProps);
    const tStyle = textStyle(CanvasKit, textProps);
    const pStyle = paragraphStyle(CanvasKit, tStyle, textProps);
    const builder = CanvasKit.ParagraphBuilder.Make(pStyle, fontMgr);
    const bg = new CanvasKit.Paint();
    bg.setAntiAlias(true);
    bg.setColor([0, 0, 0, 0]);
    processTokens(CanvasKit, builder, nodes, fg, bg, tStyle);
    const p = builder.build();
    p.layout(width);
    if (onLayout) {
      onLayout({ height: p.getHeight() });
    }
    canvas.drawParagraph(p, x, y);
  },
  children: [],
});

export interface SpanProps extends TextStyle, CustomPaintProps {
  children?: ReactNode;
}

export const Span = (props: SpanProps) => {
  return <skSpan {...props} />;
};

export const SpanNode = (
  props: SpanProps,
  instance?: string
): SkNode<NodeType.Span> => ({
  type: NodeType.Span,
  props,
  draw(ctx, { ...style }, children) {
    if (this.instance !== undefined) {
      return {
        style,
        text: this.instance,
      };
    }
    return {
      style,
      children: processChildren(ctx, children),
    };
  },
  children: [],
  instance,
});
