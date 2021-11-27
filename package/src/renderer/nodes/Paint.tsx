import type { ReactNode } from "react";
import { forwardRef } from "react";

import type { SkNode } from "../Host";
import { NodeType, processChildren } from "../Host";
import type { IPaint } from "../../skia";
import { isShader } from "../../skia/Shader/Shader";
import { isMaskFilter } from "../../skia/MaskFilter";

import type { CustomPaintProps } from "./processors";
import { processPaint } from "./processors";

export interface PaintProps extends Omit<CustomPaintProps, "paint"> {
  children?: ReactNode | ReactNode[];
}

export const Paint = forwardRef<IPaint, PaintProps>((props, ref) => {
  return <skPaint ref={ref} {...props} />;
});

export const PaintNode = (
  props: PaintProps,
  paint: IPaint
): SkNode<NodeType.Paint> => ({
  type: NodeType.Paint,
  props,
  draw: (ctx, paintProps, _children) => {
    processPaint(paint, ctx.opacity, paintProps);
    const children = processChildren(
      { ...ctx, paint, opacity: ctx.opacity },
      _children
    );
    children.forEach((child) => {
      if (isShader(child)) {
        paint.setShader(child);
      } else if (isMaskFilter(child)) {
        paint.setMaskFilter(child);
      }
    });
  },
  children: [],
  instance: paint,
  // TODO: set to false if we animate the paint
  memoizable: true,
});
