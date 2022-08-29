import type { SkJSIInstance } from "../../skia/types";
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
  // This cast is ok because we understand that the dependency manager will setup the initial props
  resolvedProps: P = {} as P;
  memoizable = false;
  memoized: DeclarationResult | null = null;
  parent?: Node;
  depMgr: DependencyManager;

  constructor(depMgr: DependencyManager, props: AnimatedProps<P>) {
    this.depMgr = depMgr;
    this.updatePropSubscriptions(props);
  }

  abstract draw(ctx: DrawingContext): void | DeclarationResult;

  updatePropSubscriptions(props: AnimatedProps<P>) {
    this.depMgr.subscribeNode(this, props);
  }

  set props(props: AnimatedProps<P>) {
    this.depMgr.unsubscribeNode(this);
    this.updatePropSubscriptions(props);
  }

  get props(): P {
    return this.resolvedProps;
  }

  visit(ctx: DrawingContext, children?: Node[]) {
    const returnedValues: Exclude<DeclarationResult, null>[] = [];
    (children ?? this.children).forEach((child) => {
      if (child.memoized && child.memoizable) {
        returnedValues.push(child.memoized);
      } else {
        const ret = child.draw(ctx);
        if (ret) {
          returnedValues.push(ret);
          if (child.memoizable) {
            child.memoized = ret;
          }
        }
      }
    });
    return returnedValues;
  }
}
