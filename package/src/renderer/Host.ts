import type { ForwardedRef } from "react";

import type { IPaint, IRuntimeEffect } from "../skia";

import type { DrawingContext } from "./DrawingContext";
import type { AnimatedProps } from "./nodes/processors/Animations";
import type { DeclarationResult } from "./nodes/Declaration";
import type {
  ShaderProps,
  RuntimeEffectProps,
  GroupProps,
  RadialGradientProps,
  LinearGradientProps,
  PaintProps,
  DeclarationProps,
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
  Paint = "skPaint",
  RadialGradient = "skRadialGradient",
  LinearGradient = "skLinearGradient",
  ColorMatrix = "skColorMatrix",
  Shader = "skShader",
  RuntimeEffect = "skRuntimeEffect",
  Declaration = "skDeclaration",
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
  [NodeType.Group]: AnimatedProps<GroupProps>;
  [NodeType.Paint]: PaintProps;
  [NodeType.RadialGradient]: RadialGradientProps;
  [NodeType.LinearGradient]: LinearGradientProps;
  [NodeType.ColorMatrix]: ColorMatrixProps;
  [NodeType.Shader]: ShaderProps;
  [NodeType.RuntimeEffect]: RuntimeEffectProps;
  [NodeType.Declaration]: DeclarationProps;
  [NodeType.Drawing]: DrawingProps;
  //[NodeType.DropShadow]: DropShadowProps;
  //  [NodeType.Paragraph]: ParagraphProps;
  // [NodeType.Text]: TextProps;
  // [NodeType.Span]: SpanProps;
}

export interface NodeInstance {
  [NodeType.Paint]: IPaint;
  [NodeType.RuntimeEffect]: IRuntimeEffect;
  //[NodeType.Span]: string;
}

export interface SkNode<T extends NodeType = NodeType> {
  readonly type: T;
  readonly draw: (
    ctx: DrawingContext,
    props: NodeProps[T],
    children: SkNode[]
  ) => void | DeclarationResult;
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
      skPaint: NodeProps[NodeType.Paint] & RefProps<IPaint>;
      skRadialGradient: NodeProps[NodeType.RadialGradient];
      skLinearGradient: NodeProps[NodeType.LinearGradient];
      skColorMatrix: NodeProps[NodeType.ColorMatrix];
      skShader: NodeProps[NodeType.Shader];
      skRuntimeEffect: NodeProps[NodeType.RuntimeEffect] &
        RefProps<IRuntimeEffect>;
      skDeclaration: NodeProps[NodeType.Declaration];
      // skDropShadow: NodeProps[NodeType.DropShadow];
      // skParagraph: NodeProps[NodeType.Paragraph];
      skDrawing: NodeProps[NodeType.Drawing];
      // skText: NodeProps[NodeType.Text];
      // skSpan: NodeProps[NodeType.Span];
    }
  }
}

export const processChildren = (ctx: DrawingContext, children: SkNode[]) => {
  const returnedValues: Exclude<DeclarationResult, null>[] = [];
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
