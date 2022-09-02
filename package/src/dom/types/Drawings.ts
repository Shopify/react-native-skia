import type { SkImage } from "../../skia/types";

import type { CircleDef, Fit, RectDef } from "./Common";
import type { DrawingNodeProps } from "./Node";

export type ImageProps = DrawingNodeProps &
  RectDef & {
    fit: Fit;
    image: SkImage;
  };

export type CircleProps = CircleDef & DrawingNodeProps;
