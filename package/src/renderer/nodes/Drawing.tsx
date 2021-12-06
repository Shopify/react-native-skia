import React, { useCallback } from "react";

import { NodeType } from "../Host";
import type { SkNode } from "../Host";
import type { DrawingContext } from "../DrawingContext";
import type { CustomPaintProps } from "../processors";
import { processPaint, selectPaint } from "../processors";
import type { AnimatedProps } from "../processors/Animations/Animations";
import { materialize } from "../processors/Animations/Animations";

type DrawingCallback = (ctx: DrawingContext, children: SkNode[]) => void;

type UseDrawingCallback<T> = (
  ctx: DrawingContext,
  props: T,
  children: SkNode[]
) => void;

export const useDrawing = <T,>(
  props: AnimatedProps<T>,
  cb: UseDrawingCallback<T>
) =>
  useCallback<DrawingCallback>(
    (ctx, children) => {
      const materializedProps = materialize(ctx, props);
      cb(ctx, materializedProps, children);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [props]
  );

export interface DrawingProps extends AnimatedProps<CustomPaintProps> {
  onDraw: DrawingCallback;
}

export const Drawing = (props: DrawingProps) => {
  return <skDrawing {...props} />;
};

export const DrawingNode = (props: DrawingProps): SkNode<NodeType.Drawing> => ({
  type: NodeType.Drawing,
  props,
  draw: (ctx, { onDraw, ...newProps }, children) => {
    const drawingProps = materialize(ctx, newProps);
    const selectedPaint = selectPaint(ctx.paint, drawingProps);
    processPaint(selectedPaint, ctx.opacity, drawingProps);
    onDraw({ ...ctx, paint: selectedPaint }, children);
  },
  children: [],
});
