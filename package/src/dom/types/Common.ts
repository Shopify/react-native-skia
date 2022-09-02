import type { ReactNode } from "react";

import type { SkPath, SkRect, SkRRect, Vector } from "../../skia/types";

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

export type Radius = number | Vector;

export interface ChildrenProps {
  children?: ReactNode | ReactNode[];
}
