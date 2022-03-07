import React from "react";

import { NodeType, SkNode } from "../Host";
import type { DrawingContext } from "../DrawingContext";
import type { CustomPaintProps } from "../processors";
import { processPaint, selectPaint } from "../processors";
import type { AnimatedProps } from "../processors/Animations/Animations";
import { materialize } from "../processors/Animations/Animations";
import { isPaint } from "../../skia";

type DrawingCallback = (ctx: DrawingContext, node: SkNode) => void;

type OnDrawCallback<T> = (ctx: DrawingContext, props: T, node: SkNode) => void;

export const createDrawing =
  <T,>(cb: OnDrawCallback<T>): DrawingCallback =>
  (ctx, node) => {
    const materializedProps = materialize(node.props as AnimatedProps<T>);
    cb(ctx, materializedProps, node);
  };

export type DrawingProps = AnimatedProps<CustomPaintProps> & {
  onDraw: DrawingCallback;
  skipProcessing?: boolean;
};

export const Drawing = (props: DrawingProps) => {
  return <skDrawing {...props} />;
};

export class DrawingNode extends SkNode<NodeType.Drawing> {
  constructor(props: DrawingProps) {
    super(NodeType.Drawing, props);
  }

  draw(ctx: DrawingContext) {
    const { skipProcessing, onDraw, ...newProps } = this.props;
    if (skipProcessing) {
      onDraw(ctx, this);
    } else {
      const drawingProps = materialize(newProps);
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
        onDraw({ ...ctx, paint }, this);
      });
    }
  }
}
