import React from "react";

import type { SkImage } from "../../../skia/types";
import type { CustomPaintProps, AnimatedProps } from "../../processors";
import { createDrawing } from "../../nodes/Drawing";
import type { RectDef } from "../../../dom/types";
import { processRect } from "../../../dom/nodes/datatypes";

import type { Fit } from "./BoxFit";
import { fitRects } from "./BoxFit";

export type SourceImageProps = {
  image: SkImage;
};

export type BaseImageProps = RectDef &
  SourceImageProps & {
    fit: Fit;
  };

export type ImageProps = CustomPaintProps & BaseImageProps;

const onDraw = createDrawing<ImageProps>(
  ({ canvas, paint, Skia }, { fit, image, ...rectProps }) => {
    const rect = processRect(Skia, rectProps);
    const { src, dst } = fitRects(
      fit,
      {
        x: 0,
        y: 0,
        width: image.width(),
        height: image.height(),
      },
      rect
    );
    canvas.drawImageRect(image, src, dst, paint);
  }
);
export const Image = (props: AnimatedProps<ImageProps>) => {
  return <skDrawing onDraw={onDraw} {...props} />;
};

Image.defaultProps = {
  x: 0,
  y: 0,
  fit: "contain",
};
