import { isPaint } from "../skia/Paint/Paint";

import type { DrawingContext } from "./DrawingContext";
import type { DeclarationResult, DeclarationProps } from "./nodes/Declaration";
import type { DrawingProps } from "./nodes";
import type { AnimatedProps } from "./processors/Animations/Animations";
import type { DependencyManager } from "./DependencyManager";

export enum NodeType {
  Declaration = "skDeclaration",
  Drawing = "skDrawing",
}

export abstract class Node<P = unknown> {
  readonly children: Node[] = [];
  _props: AnimatedProps<P>;
  memoizable = false;
  memoized = false;
  parent?: Node;
  depMgr: DependencyManager;

  constructor(depMgr: DependencyManager, props: AnimatedProps<P>) {
    this._props = props;
    this.depMgr = depMgr;
    this.depMgr.unSubscribeNode(this);
    this.depMgr.subscribeNode(this, props);
  }

  abstract draw(ctx: DrawingContext): void | DeclarationResult;

  set props(props: AnimatedProps<P>) {
    this.depMgr.unSubscribeNode(this);
    this.depMgr.subscribeNode(this, props);
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

export class Container extends Node {
  redraw: () => void;

  constructor(depMgr: DependencyManager, redraw: () => void) {
    super(depMgr, {});
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      skDeclaration: DeclarationProps<any>;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      skDrawing: DrawingProps<any>;
    }
  }
}
