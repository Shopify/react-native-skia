import type { ReactNode } from "react";
import { useCallback } from "react";

import { NodeType } from "../Host";
import type { SkNode } from "../Host";
import type { DrawingContext } from "../DrawingContext";

import type { CustomPaintProps } from "./processors";
import { processPaint, selectPaint } from "./processors";

type OnDrawCallback = (
  ctx: DrawingContext,
  children: SkNode<NodeType>[]
) => void;

export const useDrawingCallback = (
  cb: OnDrawCallback,
  deps: Parameters<typeof useCallback>[1]
  // eslint-disable-next-line react-hooks/exhaustive-deps
) => useCallback(cb, deps);

export interface DrawingProps extends CustomPaintProps {
  onDraw: OnDrawCallback;
  children?: ReactNode | ReactNode[];
}

export const Drawing = (props: DrawingProps) => {
  return <skDrawing {...props} />;
};

export const DrawingNode = (props: DrawingProps): SkNode<NodeType.Drawing> => ({
  type: NodeType.Drawing,
  props,
  draw: (ctx, { onDraw, ...drawingProps }, children) => {
    const selectedPaint = selectPaint(ctx.paint, drawingProps);
    processPaint(selectedPaint, ctx.opacity, drawingProps);
    onDraw({ ...ctx, paint: selectedPaint }, children);
  },
  children: [],
});
