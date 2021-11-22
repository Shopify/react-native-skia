import type { ForwardedRef } from "react";

import type { IPaint, IRuntimeEffect } from "../skia";

import type { DrawingContext } from "./DrawingContext";
import type {
  ShaderProps,
  RuntimeEffectProps,
  ImageShaderProps,
  RectProps,
  CircleProps,
  GroupProps,
  RadialGradientProps,
  LinearGradientProps,
  FillProps,
  PaintProps,
  BlurProps,
  ImageProps,
  PathProps,
  LineProps,
  // DropShadowProps,
  // ParagraphProps,
  ColorMatrixProps,
  DrawingProps,
  // TextProps,
  // SpanProps,
} from "./nodes";

export enum NodeType {
  Canvas = "skCanvas",
  Group = "skGroup",
  Circle = "skCircle",
  Fill = "skFill",
  Paint = "skPaint",
  RadialGradient = "skRadialGradient",
  LinearGradient = "skLinearGradient",
  ColorMatrix = "skColorMatrix",
  Blur = "skBlur",
  Shader = "skShader",
  RuntimeEffect = "skRuntimeEffect",
  Image = "skImage",
  ImageShader = "skImageShader",
  Rect = "skRect",
  Line = "skLine",
  Path = "skPath",
  Drawing = "skDrawing",
  // DropShadow = "skDropShadow",
  // Paragraph = "skParagraph",
  // Text = "skText",
  // Span = "skSpan",
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface CanvasProps {}

export interface NodeProps {
  [NodeType.Canvas]: CanvasProps;
  [NodeType.Group]: GroupProps;
  [NodeType.Circle]: CircleProps;
  [NodeType.Fill]: FillProps;
  [NodeType.Paint]: PaintProps;
  [NodeType.RadialGradient]: RadialGradientProps;
  [NodeType.LinearGradient]: LinearGradientProps;
  [NodeType.ColorMatrix]: ColorMatrixProps;
  [NodeType.Blur]: BlurProps;
  [NodeType.Shader]: ShaderProps;
  [NodeType.RuntimeEffect]: RuntimeEffectProps;
  [NodeType.Image]: ImageProps;
  [NodeType.ImageShader]: ImageShaderProps;
  [NodeType.Rect]: RectProps;
  [NodeType.Path]: PathProps;
  [NodeType.Drawing]: DrawingProps;
  //[NodeType.DropShadow]: DropShadowProps;
  [NodeType.Line]: LineProps;
  //  [NodeType.Paragraph]: ParagraphProps;
  // [NodeType.Text]: TextProps;
  // [NodeType.Span]: SpanProps;
}

export interface NodeInstance {
  [NodeType.Paint]: IPaint;
  [NodeType.RuntimeEffect]: IRuntimeEffect;
  //[NodeType.Span]: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ReturnedValue = any; //Shader | Text[];

export interface SkNode<T extends NodeType = NodeType> {
  readonly type: T;
  readonly draw: (
    ctx: DrawingContext,
    props: NodeProps[T],
    children: SkNode[]
  ) => void | ReturnedValue;
  readonly children: SkNode[];
  readonly memoizable?: boolean;
  parent?: SkNode;

  props: NodeProps[T];
  memoized?: boolean;
  instance?: T extends keyof NodeInstance ? NodeInstance[T] : undefined;
}

export interface SkContainer extends SkNode<NodeType.Canvas> {
  redraw: () => void;
}

type RefProps<T> = { ref: ForwardedRef<T> };

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      skGroup: NodeProps[NodeType.Group];
      skCircle: NodeProps[NodeType.Circle];
      skFill: NodeProps[NodeType.Fill];
      skPaint: NodeProps[NodeType.Paint] & RefProps<IPaint>;
      skRadialGradient: NodeProps[NodeType.RadialGradient];
      skLinearGradient: NodeProps[NodeType.LinearGradient];
      skColorMatrix: NodeProps[NodeType.ColorMatrix];
      skBlur: NodeProps[NodeType.Blur];
      skShader: NodeProps[NodeType.Shader];
      skRuntimeEffect: NodeProps[NodeType.RuntimeEffect] &
        RefProps<IRuntimeEffect>;
      skImage: NodeProps[NodeType.Image];
      skImageShader: NodeProps[NodeType.ImageShader];
      skRect: NodeProps[NodeType.Rect];
      skLine: NodeProps[NodeType.Line];
      skPath: NodeProps[NodeType.Path];
      // skDropShadow: NodeProps[NodeType.DropShadow];
      // skParagraph: NodeProps[NodeType.Paragraph];
      skDrawing: NodeProps[NodeType.Drawing];
      // skText: NodeProps[NodeType.Text];
      // skSpan: NodeProps[NodeType.Span];
    }
  }
}

export const processChildren = (ctx: DrawingContext, children: SkNode[]) => {
  const returnedValues: ReturnedValue[] = [];
  children.forEach((child) => {
    if (!child.memoized) {
      const ret = child.draw(ctx, child.props, child.children);
      if (ret) {
        returnedValues.push(ret);
      }
      if (child.memoizable) {
        child.memoized = true;
      }
    }
  });
  return returnedValues;
};

interface DebugTree {
  type: NodeType;
  props: Record<string, unknown>;
  children: DebugTree[];
  memoized?: boolean;
}

export const debugTree = ({
  type,
  children,
  props,
  memoized,
}: SkNode): DebugTree => {
  return {
    type,
    // eslint-disable-next-line @typescript-eslint/ban-types
    props: Object.keys(props as object)
      .filter((key) => key !== "children")
      .reduce(
        (p, key) => ({ ...p, [key]: (props as Record<string, unknown>)[key] }),
        {}
      ),
    children: children.map((child) => debugTree(child)),
    memoized,
  };
};

export const countNodes = (node: SkNode): number => {
  if (node.children.length === 0) {
    return 1;
  }
  return node.children
    .map((child) => countNodes(child))
    .reduce((a, b) => a + b, 0);
};
