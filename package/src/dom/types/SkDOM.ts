import type { ReactNode, RefObject } from "react";

import type {
  BlendMode,
  Color,
  PaintStyle,
  SkMatrix,
  SkPaint,
  SkPath,
  SkRect,
  SkRRect,
  StrokeCap,
  StrokeJoin,
  Transforms2d,
  Vector,
} from "../../skia/types";

import type { GroupNode } from "./Node";

export type SkEnum<T> = Uncapitalize<keyof T extends string ? keyof T : never>;

export type PathDef = string | SkPath;

export type ClipDef = SkRRect | SkRect | PathDef;

export type Fit =
  | "cover"
  | "contain"
  | "fill"
  | "fitHeight"
  | "fitWidth"
  | "none"
  | "scaleDown";

export interface TransformProps {
  transform?: Transforms2d;
  origin?: Vector;
  matrix?: SkMatrix;
}

export interface ChildrenProps {
  children?: ReactNode | ReactNode[];
}

export interface PaintProps extends ChildrenProps {
  paint?: RefObject<SkPaint>;
  color?: Color;
  strokeWidth?: number;
  blendMode?: SkEnum<typeof BlendMode>;
  style?: SkEnum<typeof PaintStyle>;
  strokeJoin?: SkEnum<typeof StrokeJoin>;
  strokeCap?: SkEnum<typeof StrokeCap>;
  strokeMiter?: number;
  opacity?: number;
  antiAlias?: boolean;
}

export interface GroupProps extends PaintProps, TransformProps {
  clip?: ClipDef;
  invertClip?: boolean;
  layer?: RefObject<SkPaint> | SkPaint | boolean;
}

export interface SkDOM {
  Group: (props?: GroupProps) => GroupNode;
}
