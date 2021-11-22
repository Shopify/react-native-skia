import { NodeType } from "../../Host";
import type { SkNode } from "../../Host";
import type { CustomPaintProps } from "../processors";
import { processPaint, selectPaint } from "../processors";
import { Skia } from "../../../skia";

export interface RectProps extends CustomPaintProps {
  x: number;
  y: number;
  width: number;
  height: number;
  rx?: number;
  ry?: number;
}

export const Rect = (props: RectProps) => {
  return <skRect {...props} />;
};

Rect.defaultProps = {
  x: 0,
  y: 0,
};

export const RectNode = (props: RectProps): SkNode<NodeType.Rect> => ({
  type: NodeType.Rect,
  props,
  draw: (ctx, { x, y, width, height, rx, ry, ...rectProps }) => {
    const { canvas, opacity } = ctx;
    const paint = selectPaint(ctx.paint, rectProps);
    processPaint(paint, opacity, rectProps);
    const rect = Skia.XYWHRect(x, y, x + width, y + height);
    [x, y, x + width, y + height];
    if (rx !== undefined || ry !== undefined) {
      const corner = [(rx ?? ry) as number, (ry ?? rx) as number];
      canvas.drawRRect(Skia.RRectXY(rect, corner[0], corner[1]), paint);
    } else {
      canvas.drawRect(rect, paint);
    }
  },
  children: [],
});
