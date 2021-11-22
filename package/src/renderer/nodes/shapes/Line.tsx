import type { DrawingContext } from "../../CanvasKitView";
import { NodeType } from "../../Host";
import type { SkNode } from "../../Host";
import type { CustomPaintProps } from "../processors";
import { processPaint, selectPaint } from "../processors";

export interface LineProps extends CustomPaintProps {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export const Line = (props: LineProps) => {
  return <skLine {...props} />;
};

export const LineNode = (props: LineProps): SkNode<NodeType.Line> => ({
  type: NodeType.Line,
  props,
  draw: (ctx: DrawingContext, { x1, y1, x2, y2, ...lineProps }) => {
    const { opacity, canvas } = ctx;
    const paint = selectPaint(ctx.paint, lineProps);
    processPaint(paint, opacity, lineProps);
    canvas.drawLine(x1, y1, x2, y2, paint);
  },
  children: [],
});
