import type { DrawingContext } from "./DrawingContext";
import type { DeclarationResult } from "./nodes/Declaration";
import type {
  DeclarationProps,
  // DropShadowProps,
  // ParagraphProps,
  DrawingProps,
  // TextProps,
  // SpanProps,
} from "./nodes";

export enum NodeType {
  Canvas = "skCanvas",
  Declaration = "skDeclaration",
  Drawing = "skDrawing",
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface CanvasProps {}

export interface NodeProps {
  [NodeType.Canvas]: CanvasProps;
  [NodeType.Declaration]: DeclarationProps;
  [NodeType.Drawing]: DrawingProps;
}

export interface SkNode<T extends NodeType = NodeType> {
  readonly type: T;
  readonly draw: (
    ctx: DrawingContext,
    props: NodeProps[T],
    children: SkNode[]
  ) => void | DeclarationResult;
  readonly children: SkNode[];
  memoizable?: boolean;
  parent?: SkNode;
  props: NodeProps[T];
  memoized?: boolean;
}

export interface SkContainer extends SkNode<NodeType.Canvas> {
  redraw: () => void;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      skDeclaration: NodeProps[NodeType.Declaration];
      skDrawing: NodeProps[NodeType.Drawing];
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
