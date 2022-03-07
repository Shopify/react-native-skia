import React from "react";

import { NodeType, SkNode } from "../Host";
import type { DrawingContext } from "../DrawingContext";
import type { CustomPaintProps } from "../processors";
import { processPaint, selectPaint } from "../processors";
import type { AnimatedProps } from "../processors/Animations/Animations";
import { materialize } from "../processors/Animations/Animations";
import { isPaint } from "../../skia";

type DrawingCallback<T> = (ctx: DrawingContext, props: T, node: SkNode) => void;

type OnDrawCallback<T> = (ctx: DrawingContext, props: T, node: SkNode) => void;

export const createDrawing = <T,>(cb: OnDrawCallback<T>): DrawingCallback<T> =>
  cb;

export type DrawingProps<T> = AnimatedProps<CustomPaintProps> & {
  onDraw: DrawingCallback<T>;
  skipProcessing?: boolean;
};

export const Drawing = <T,>(props: DrawingProps<T>) => {
  return <skDrawing {...props} />;
};

export class DrawingNode<T> extends SkNode<NodeType.Drawing> {
  constructor(props: DrawingProps<T>) {
    super(NodeType.Drawing, props);
  }

  draw(ctx: DrawingContext) {
    const { skipProcessing, onDraw, ...newProps } = this.props;
    const drawingProps = materialize(newProps as AnimatedProps<T>);
    if (skipProcessing) {
      onDraw(ctx, drawingProps, this);
    } else {
      const selectedPaint = selectPaint(ctx.paint, drawingProps);
      processPaint(selectedPaint, ctx.opacity, drawingProps);
      // to draw only once:
      // onDraw({ ...ctx, paint: selectedPaint }, children);
      [
        selectedPaint,
        ...this.children
          .map((child) => {
            if (child.type === NodeType.Declaration) {
              const ret = child.draw(ctx);
              if (ret) {
                return ret;
              }
            }
            return null;
          })
          .filter(isPaint),
      ].forEach((paint) => {
        onDraw({ ...ctx, paint }, drawingProps, this);
      });
    }
  }
}
