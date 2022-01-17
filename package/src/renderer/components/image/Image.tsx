import React from "react";

import type { IImage } from "../../../skia";
import type { CustomPaintProps } from "../../processors/Paint";
import { useDrawing } from "../../nodes/Drawing";
import type { RectDef } from "../../processors/Shapes";
import { processRect } from "../../processors/Shapes";
import type { AnimatedProps } from "../../processors/Animations/Animations";

import type { Fit } from "./BoxFit";
import { fitRects } from "./BoxFit";

export interface SourceProps {
  source: IImage;
}

export type ImageProps = RectDef &
  CustomPaintProps &
  SourceProps & {
    fit: Fit;
  };

export const Image = (props: AnimatedProps<ImageProps>) => {
  const onDraw = useDrawing(
    props,
    ({ canvas, paint }, { fit, source, ...rectProps }) => {
      const rect = processRect(rectProps);
      const { src, dst } = fitRects(
        fit,
        {
          x: 0,
          y: 0,
          width: source.width(),
          height: source.height(),
        },
        rect
      );
      canvas.drawImageRect(source, src, dst, paint);
    }
  );
  return <skDrawing onDraw={onDraw} {...props} />;
};

Image.defaultProps = {
  x: 0,
  y: 0,
  fit: "contain",
};
