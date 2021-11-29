import type { IImage } from "../../../skia";
import { useImage } from "../../../skia";
import type { CustomPaintProps } from "../../processors/Paint";
import { useDrawing } from "../../nodes/Drawing";
import type { RectDef } from "../../processors/Shapes";
import { processRect } from "../../processors/Shapes";
import type { AnimatedProps } from "../../processors/Animations/Animations";
import { materialize } from "../../processors/Animations/Animations";

import type { Fit } from "./BoxFit";
import { fitRects } from "./BoxFit";

export type ImageProps = RectDef &
  CustomPaintProps & {
    source: number | IImage;
    fit: Fit;
  };

export const Image = (props: AnimatedProps<ImageProps, "source">) => {
  const image = useImage(props.source);
  const onDraw = useDrawing(
    (ctx) => {
      if (image === null) {
        return;
      }
      const { canvas, paint } = ctx;
      const { fit, ...rectProps } = materialize(ctx, props);
      const rect = processRect(rectProps);
      const { src, dst } = fitRects(fit, image, rect);
      canvas.drawImageRect(image, src, dst, paint);
    },
    [image, props]
  );
  return <skDrawing onDraw={onDraw} {...props} />;
};

Image.defaultProps = {
  x: 0,
  y: 0,
  fit: "contain",
};
