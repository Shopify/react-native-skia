import type { FillType, SkImage, StrokeOpts, Vector } from "../../skia/types";

import type { CircleDef, Fit, PathDef, RectDef, SkEnum } from "./Common";
import type { DrawingContext } from "./DrawingContext";
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

export interface CustomDrawingNodeProps extends DrawingNodeProps {
  onDraw: (ctx: DrawingContext) => void;
}

export interface LineProps extends DrawingNodeProps {
  p1: Vector;
  p2: Vector;
}

export type OvalProps = RectDef & DrawingNodeProps;
