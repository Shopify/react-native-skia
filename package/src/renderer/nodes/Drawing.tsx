import { NodeType } from "../Host";
import type { SkNode } from "../Host";
import type { DrawingContext } from "../DrawingContext";

import type { CustomPaintProps } from "./processors";
import { processPaint, selectPaint } from "./processors";
import type { AnimatedProps } from "./processors/Animations/Animations";
import { materialize } from "./processors/Animations/Animations";

type OnDrawCallback = (ctx: DrawingContext) => void;

export interface DrawingProps extends AnimatedProps<CustomPaintProps> {
  onDraw: OnDrawCallback;
}

export const Drawing = (props: DrawingProps) => {
  return <skDrawing {...props} />;
};

export const DrawingNode = (props: DrawingProps): SkNode<NodeType.Drawing> => ({
  type: NodeType.Drawing,
  props,
  draw: (ctx, { onDraw, ...newProps }) => {
    const drawingProps = materialize(ctx, newProps);
    const selectedPaint = selectPaint(ctx.paint, drawingProps);
    processPaint(selectedPaint, ctx.opacity, drawingProps);
    onDraw({ ...ctx, paint: selectedPaint });
  },
  children: [],
});
