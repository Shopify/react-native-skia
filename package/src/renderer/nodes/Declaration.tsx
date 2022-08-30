import type { DependencyList } from "react";
import { useCallback } from "react";

import type { DrawingContext } from "../DrawingContext";
import type { AnimatedProps } from "../processors";
import { isAnimated } from "../processors";
import type { DependencyManager } from "../DependencyManager";
import type { SkJSIInstance } from "../../skia/types";

import { Node } from "./Node";

export type DeclarationResult = SkJSIInstance<string> | null;

type DeclarationCallback<T> = (
  props: T,
  children: DeclarationResult[],
  ctx: DrawingContext
) => DeclarationResult;

export const createDeclaration = <T,>(
  cb: DeclarationCallback<T>
): DeclarationCallback<T> => cb;

export const useDeclaration = <P,>(
  cb: DeclarationCallback<P>,
  deps?: DependencyList
) =>
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useCallback(cb, deps ?? []);

export const isDeclarationNode = <P,>(node: Node): node is DeclarationNode<P> =>
  node instanceof DeclarationNode;

export interface DeclarationProps<P> {
  onDeclare: DeclarationCallback<P>;
}

export class DeclarationNode<P> extends Node<P> {
  private onDeclare: DeclarationCallback<P>;

  constructor(
    depMgr: DependencyManager,
    onDeclare: DeclarationCallback<P>,
    props: AnimatedProps<P>
  ) {
    super(depMgr, props);
    super.memoizable = !isAnimated(props);
    this.onDeclare = onDeclare;
  }

  set props(props: AnimatedProps<P>) {
    this.memoizable = !isAnimated(props);
    super.props = props;
  }

  get props(): P {
    return this.resolvedProps;
  }

  draw(ctx: DrawingContext) {
    const children = this.visit(ctx);
    const obj = this.onDeclare(this.props, children, ctx);
    return obj;
  }
}
