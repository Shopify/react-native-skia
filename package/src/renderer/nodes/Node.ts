import { isPaint } from "../../skia";
import type { SkJSIInstance } from "../../skia/JsiInstance";
import type { DependencyManager } from "../DependencyManager";
import type { DrawingContext } from "../DrawingContext";
import type { AnimatedProps } from "../processors";

export enum NodeType {
  Declaration = "skDeclaration",
  Drawing = "skDrawing",
}

type DeclarationResult = SkJSIInstance<string> | null;

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
