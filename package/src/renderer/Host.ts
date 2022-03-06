import { isPaint } from "../skia/Paint/Paint";

import type { DrawingContext } from "./DrawingContext";
import type { DeclarationResult } from "./nodes/Declaration";
import type { DeclarationProps, DrawingProps } from "./nodes";

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

export abstract class SkNode<T extends NodeType = NodeType> {
  readonly type: T;
  readonly children: SkNode[] = [];
  props: NodeProps[T];
  memoizable = false;
  memoized = false;
  parent?: SkNode;

  constructor(type: T, props: NodeProps[T]) {
    this.type = type;
    this.props = props;
  }

  abstract draw(ctx: DrawingContext): void | DeclarationResult;

  visit(ctx: DrawingContext) {
    const returnedValues: Exclude<DeclarationResult, null>[] = [];
    let currentCtx = ctx;
    this.children.forEach((child) => {
      if (!child.memoized) {
        const ret = child.draw(currentCtx);
        if (ret) {
          if (isPaint(ret)) {
            currentCtx = { ...currentCtx, paint: ret };
          }
          returnedValues.push(ret);
        }
        if (child.memoizable) {
          child.memoized = true;
        }
      }
    });
    return returnedValues;
  }
}

export abstract class SkContainer extends SkNode<NodeType.Canvas> {
  redraw: () => void;

  constructor(redraw: () => void) {
    super(NodeType.Canvas, {});
    this.redraw = redraw;
  }
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
