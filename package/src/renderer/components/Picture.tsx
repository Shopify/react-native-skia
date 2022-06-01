import React from "react";

import type { SkPicture } from "../../skia/types";
import { createDrawing } from "../nodes/Drawing";

export interface PictureProps {
  picture: SkPicture;
}

const onDraw = createDrawing<PictureProps>((ctx, { picture }) => {
  const { canvas } = ctx;
  canvas.drawPicture(picture);
});

export const Picture = (props: PictureProps) => {
  return <skDrawing onDraw={onDraw} {...props} skipProcessing />;
};
