import type { SkJSIInstance } from "../../skia/types";
import type { DependencyManager } from "../DependencyManager";
import type { DrawingContext } from "../DrawingContext";
import type { AnimatedProps } from "../processors";

export enum NodeType {
  Declaration = "skDeclaration",
  Drawing = "skDrawing",
}

type DeclarationResult = SkJSIInstance<string> | null;

export type NodeProps<P extends Partial<Record<keyof P, unknown>>> = Partial<
  Record<keyof P, unknown>
>;

export abstract class Node<P extends NodeProps<P> = Record<string, unknown>> {
  readonly children: Node[] = [];
  resolvedProps: Partial<P> = {};
  memoizable = false;
  memoized: DeclarationResult | null = null;
  parent?: Node;
  depMgr: DependencyManager;

  constructor(depMgr: DependencyManager, props: AnimatedProps<P>) {
    this.depMgr = depMgr;
    this.updatePropSubscriptions(props);
  }

  abstract draw(ctx: DrawingContext): void | DeclarationResult;

  removeNode() {
    this.depMgr.unsubscribeNode(this);
  }

  updatePropSubscriptions(props: AnimatedProps<P>) {
    this.depMgr.subscribeNode(
      this,
      props,
      <K extends keyof P>(key: K, value: P[K]) => {
        this.resolvedProps[key] = value;
      }
    );
  }

  set props(props: AnimatedProps<P>) {
    this.depMgr.unsubscribeNode(this);
    this.updatePropSubscriptions(props);
  }

  get props() {
    return this.resolvedProps as unknown as P;
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
