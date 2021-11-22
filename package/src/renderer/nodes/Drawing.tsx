import { NodeType } from "../Host";
import type { SkNode } from "../Host";
import type { DrawingContext } from "../DrawingContext";

import type { CustomPaintProps } from "./processors";
import { processPaint, selectPaint } from "./processors";

export interface DrawingProps extends CustomPaintProps {
  onDraw: (canvas: DrawingContext) => void;
}

export const Drawing = (props: DrawingProps) => {
  return <skDrawing {...props} />;
};

export const DrawingNode = (props: DrawingProps): SkNode<NodeType.Drawing> => ({
  type: NodeType.Drawing,
  props,
  draw: (ctx, { onDraw, ...drawingProps }) => {
    const selectedPaint = selectPaint(ctx.paint, drawingProps);
    processPaint(selectedPaint, ctx.opacity, drawingProps);
    onDraw({ ...ctx, paint: selectedPaint });
  },
  children: [],
});
