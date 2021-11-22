import type { ReactNode } from "react";
import { forwardRef } from "react";

import type { SkNode } from "../Host";
import { NodeType, processChildren } from "../Host";
import { Paint as Paint } from "../../skia";

import type { CustomPaintProps } from "./processors";
import { processPaint } from "./processors";

export interface PaintProps extends Omit<CustomPaintProps, "paint"> {
  children?: ReactNode | ReactNode[];
}

export const Paint = forwardRef<Paint, PaintProps>((props, ref) => {
  return <skPaint ref={ref} {...props} />;
});

export const PaintNode = (
  props: PaintProps,
  paint: Paint
): SkNode<NodeType.Paint> => ({
  type: NodeType.Paint,
  props,
  draw: (ctx, paintProps, children) => {
    processPaint(paint, ctx.opacity, paintProps);
    processChildren({ ...ctx, paint, opacity: ctx.opacity }, children);
  },
  children: [],
  instance: paint,
  memoizable: true,
});
