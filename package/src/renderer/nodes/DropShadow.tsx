import { NodeType } from "../Host";
import type { SkNode } from "../Host";

import { processColor } from "./processors";

export interface DropShadowProps {
  dx: number;
  dy: number;
  blur: number;
  color: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rx: number;
  ry: number;
  withClipping?: boolean;
}

export const DropShadow = (props: DropShadowProps) => {
  return <skDropShadow {...props} />;
};

DropShadow.defaultProps = {
  rx: 0,
  ry: 0,
};

export const DropShadowNode = (
  props: DropShadowProps
): SkNode<NodeType.DropShadow> => ({
  type: NodeType.DropShadow,
  props,
  draw: (
    { CanvasKit, canvas, opacity },
    { dx, dy, blur, color, x, y, width, height, rx, ry, withClipping }
  ) => {
    const rrect = [
      x,
      y,
      x + width,
      y + height,
      (rx ?? ry) as number,
      (ry ?? rx) as number,
    ];
    const [x1, y1, x2, y2] = rrect;
    const path = new CanvasKit.Path();
    path.moveTo(x1, y1);
    path.lineTo(x2, y1);
    path.lineTo(x2, y2);
    path.lineTo(x1, y2);
    path.transform(CanvasKit.Matrix.translated(dx, dy));
    path.close();
    //  const t0 = performance.now();
    if (withClipping) {
      canvas.save();
      // This clipping operation is expensive, so we only do it in prod.
      canvas.clipRRect(rrect, CanvasKit.ClipOp.Difference, true);
    }
    canvas.drawShadow(
      path,
      [x + width / 2, y + height / 2, 100],
      [x, y, 100],
      blur,
      processColor(color, opacity),
      processColor("transparent", 1),
      0
    );
    if (withClipping) {
      canvas.restore();
    }
    // const t1 = performance.now();
    //  console.log({ shadow: t1 - t0 });
  },
  children: [],
});
