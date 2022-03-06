import React, { useCallback } from "react";

import { NodeType, SkNode } from "../Host";
import type { DrawingContext } from "../DrawingContext";
import type { CustomPaintProps } from "../processors";
import { processPaint, selectPaint } from "../processors";
import type { AnimatedProps } from "../processors/Animations/Animations";
import { materialize } from "../processors/Animations/Animations";
import { isPaint } from "../../skia";
import type { SkRect } from "../../skia/Rect";

type DrawingCallback = (ctx: DrawingContext, node: SkNode) => void;
type BoundsCallback = (ctx: DrawingContext, node: SkNode) => SkRect;

type UseDrawingCallback<T> = (
  ctx: DrawingContext,
  props: T,
  node: SkNode
) => void;

type UseBoundsCallback<T> = (
  ctx: DrawingContext,
  props: T,
  node: SkNode
) => SkRect;

export const useDrawing = <T,>(
  props: AnimatedProps<T>,
  cb: UseDrawingCallback<T>
) =>
  useCallback<DrawingCallback>(
    (ctx, node) => {
      const materializedProps = materialize(ctx, props);
      cb(ctx, materializedProps, node);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [props]
  );

export const useBounds = <T,>(
  props: AnimatedProps<T>,
  cb: UseBoundsCallback<T>
) =>
  useCallback<BoundsCallback>(
    (ctx, node) => {
      const materializedProps = materialize(ctx, props);
      return cb(ctx, materializedProps, node);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [props]
  );

export type DrawingProps = AnimatedProps<CustomPaintProps> & {
  onDraw: DrawingCallback;
  onBounds: BoundsCallback;
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
    const { skipProcessing, onDraw, onBounds, ...newProps } = this.props;
    if (skipProcessing) {
      onDraw(ctx, this);
    } else {
      const drawingProps = materialize(ctx, newProps);
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
