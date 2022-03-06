import React from "react";

import { useDrawing } from "../../nodes";
import type {
  CustomPaintProps,
  RRectDef,
  AnimatedProps,
} from "../../processors";
import { processRRect } from "../../processors";
import { useBounds } from "../../nodes/Drawing";

export type RoundedRectProps = RRectDef & CustomPaintProps;

export const RoundedRect = (props: AnimatedProps<RoundedRectProps>) => {
  const onDraw = useDrawing(props, ({ canvas, paint }, rectProps) => {
    const rrect = processRRect(rectProps);
    canvas.drawRRect(rrect, paint);
  });
  const onBounds = useBounds(props, (_, rectProps) => {
    const rrect = processRRect(rectProps);
    return rrect.rect;
  });
  return <skDrawing onDraw={onDraw} onBounds={onBounds} {...props} />;
};

RoundedRect.defaultProps = {
  rx: 0,
};
