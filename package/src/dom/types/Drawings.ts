import type { FillType, SkImage, StrokeOpts } from "../../skia/types";

import type { CircleDef, Fit, PathDef, RectDef, SkEnum } from "./Common";
import type { DrawingNodeProps } from "./Node";

export type ImageProps = DrawingNodeProps &
  RectDef & {
    fit: Fit;
    image: SkImage;
  };

export type CircleProps = CircleDef & DrawingNodeProps;

export interface PathProps extends DrawingNodeProps {
  path: PathDef;
  start: number;
  end: number;
  stroke?: StrokeOpts;
  fillType?: SkEnum<typeof FillType>;
}
