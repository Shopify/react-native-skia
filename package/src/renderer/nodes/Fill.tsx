import type { DrawingContext } from "../CanvasKitView";
import { NodeType } from "../Host";
import type { SkNode } from "../Host";

import type { CustomPaintProps } from "./processors";
import { selectPaint, processPaint } from "./processors";

export type FillProps = CustomPaintProps;

export const Fill = (props: FillProps) => {
  return <skFill {...props} />;
};

export const FillNode = (props: FillProps): SkNode<NodeType.Fill> => ({
  type: NodeType.Fill,
  props,
  draw: (ctx: DrawingContext, fillProps) => {
    const paint = selectPaint(ctx.paint, fillProps);
    processPaint(paint, ctx.opacity, fillProps);
    ctx.canvas.drawPaint(paint);
  },
  children: [],
});
