import type { Skia } from "../../skia/types";
import type {
  SkDOM,
  GroupProps,
  ImageProps,
  BlurImageFilterProps,
  MatrixColorFilterProps,
  CircleProps,
  BlurMaskFilterProps,
  LinearGradientProps,
  PaintProps,
} from "../types";
import type { DrawingNodeProps } from "../types/Node";

import { FillNode, ImageNode, CircleNode } from "./drawings";
import { GroupNode } from "./GroupNode";
import { BlurImageFilterNode, BlurMaskFilterNode, PaintNode } from "./paint";
import { MatrixColorFilterNode } from "./paint/ColorFilters";
import { LinearGradientNode } from "./paint/Shaders";

export class JsiSkDOM implements SkDOM {
  constructor(private Skia: Skia) {}

  Group(props?: GroupProps) {
    return new GroupNode(this.Skia, props);
  }

  Paint(props: PaintProps) {
    return new PaintNode(this.Skia, props);
  }

  // Drawings
  Fill(props?: DrawingNodeProps) {
    return new FillNode(this.Skia, props);
  }

  Image(props: ImageProps) {
    return new ImageNode(this.Skia, props);
  }

  Circle(props: CircleProps) {
    return new CircleNode(this.Skia, props);
  }

  // BlurMaskFilters
  BlurMaskFilter(props: BlurMaskFilterProps) {
    return new BlurMaskFilterNode(this.Skia, props);
  }

  // ImageFilters
  BlurImageFilter(props: BlurImageFilterProps) {
    return new BlurImageFilterNode(this.Skia, props);
  }

  // Color Filters
  MatrixColorFilter(props: MatrixColorFilterProps) {
    return new MatrixColorFilterNode(this.Skia, props);
  }

  // Shaders
  LinearGradient(props: LinearGradientProps) {
    return new LinearGradientNode(this.Skia, props);
  }
}
