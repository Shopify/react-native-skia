import React from "react";

import type { DrawingContext } from "../DrawingContext";
import { createDrawing } from "../nodes/Drawing";

interface DrawingProps {
  drawing: (ctx: DrawingContext) => void;
}

const onDraw = createDrawing<DrawingProps>((ctx, { drawing }) => {
  drawing(ctx);
});

export const Drawing = (props: DrawingProps) => {
  return <skDrawing onDraw={onDraw} skipProcessing {...props} />;
};
