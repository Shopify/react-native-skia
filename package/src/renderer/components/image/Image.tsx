import React from "react";

import type { IImage } from "../../../skia";
import type { CustomPaintProps } from "../../processors/Paint";
import { useDrawing } from "../../nodes/Drawing";
import type { RectDef } from "../../processors/Rects";
import { processRect } from "../../processors/Rects";
import type { AnimatedProps } from "../../processors/Animations/Animations";

import type { Fit } from "./BoxFit";
import { fitRects } from "./BoxFit";

export type SourceImageProps = {
  image: IImage;
};

export type BaseImageProps = RectDef &
  SourceImageProps & {
    fit: Fit;
  };

export type ImageProps = CustomPaintProps & BaseImageProps;

export const Image = (props: AnimatedProps<ImageProps>) => {
  const onDraw = useDrawing(
    props,
    ({ canvas, paint }, { fit, image, ...rectProps }) => {
      const rect = processRect(rectProps);
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
  return <skDrawing onDraw={onDraw} {...props} />;
};

Image.defaultProps = {
  x: 0,
  y: 0,
  fit: "contain",
};
