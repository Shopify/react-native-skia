import { isPaint } from "../skia/Paint/Paint";

import type { DrawingContext } from "./DrawingContext";
import type { DeclarationResult } from "./nodes/Declaration";
import type { DeclarationProps, DrawingProps } from "./nodes";

export enum NodeType {
  Container = "skContainer",
  Declaration = "skDeclaration",
  Drawing = "skDrawing",
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface CanvasProps {}

export interface NodeProps {
  [NodeType.Container]: CanvasProps;
  [NodeType.Declaration]: DeclarationProps;
  [NodeType.Drawing]: DrawingProps;
}

export abstract class SkNode<T extends NodeType = NodeType> {
  readonly type: T;
  readonly children: SkNode[] = [];
  _props: NodeProps[T];
  memoizable = false;
  memoized = false;
  parent?: SkNode;

  constructor(type: T, props: NodeProps[T]) {
    this.type = type;
    this._props = props;
  }

  abstract draw(ctx: DrawingContext): void | DeclarationResult;

  set props(props: NodeProps[T]) {
    this._props = props;
  }

  get props() {
    return this._props;
  }

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

export class Container extends SkNode<NodeType.Container> {
  redraw: () => void;

  constructor(redraw: () => void) {
    super(NodeType.Container, {});
    this.redraw = redraw;
  }

  draw(ctx: DrawingContext) {
    this.visit(ctx);
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
