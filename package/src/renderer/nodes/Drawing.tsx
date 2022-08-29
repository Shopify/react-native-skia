import type { DependencyList, ReactNode } from "react";
import { useCallback } from "react";

import type { DrawingContext } from "../DrawingContext";
import type { AnimatedProps } from "../processors/Animations/Animations";
import { isPaint } from "../../skia/types";
import type { DependencyManager } from "../DependencyManager";
import { processPaint } from "../processors";

import type { NodeProps } from "./Node";
import { Node } from "./Node";

type DrawingCallback<P extends NodeProps<P>> = (
  ctx: DrawingContext,
  props: P,
  node: Node<P>
) => void;

type OnDrawCallback<P extends NodeProps<P>> = (
  ctx: DrawingContext,
  props: P,
  node: Node<P>
) => void;

export const createDrawing = <P extends NodeProps<P>>(
  cb: OnDrawCallback<P>
): DrawingCallback<P> => cb;

export const useDrawing = <P extends NodeProps<P>>(
  cb: OnDrawCallback<P>,
  deps?: DependencyList
) =>
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useCallback(cb, deps ?? []);

export type DrawingProps<P extends NodeProps<P>> = {
  onDraw: DrawingCallback<P>;
  skipProcessing?: boolean;
  children?: ReactNode | ReactNode[];
};

export class DrawingNode<P extends NodeProps<P>> extends Node<P> {
  onDraw: DrawingCallback<P>;
  skipProcessing: boolean;

  constructor(
    depMgr: DependencyManager,
    onDraw: DrawingCallback<P>,
    skipProcessing: boolean,
    props: AnimatedProps<P>
  ) {
    super(depMgr, props);
    this.onDraw = onDraw;
    this.skipProcessing = skipProcessing;
  }

  draw(ctx: DrawingContext) {
    if (this.skipProcessing) {
      this.onDraw(ctx, this.props as P, this);
    } else {
      const declarations = this.visit(ctx);
      const paint = processPaint(
        ctx.Skia,
        ctx.paint.copy(),
        ctx.opacity,
        this.props as P,
        declarations
      );
      [paint, ...declarations.filter(isPaint)].forEach((currentPaint) => {
        this.onDraw({ ...ctx, paint: currentPaint }, this.props as P, this);
      });
    }
  }
}
