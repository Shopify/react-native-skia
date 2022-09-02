import type { Skia } from "../../skia/types";
import type {
  SkDOM,
  GroupProps,
  ImageProps,
  BlurImageFilterProps,
  MatrixColorFilterProps,
} from "../types";
import type { DrawingNodeProps } from "../types/Node";

import { FillNode, ImageNode } from "./drawings";
import { GroupNode } from "./GroupNode";
import { BlurImageFilterNode } from "./paint";
import { MatrixColorFilterNode } from "./paint/ColorFilters";

export class JsiSkDOM implements SkDOM {
  constructor(private Skia: Skia) {}

  Group(props?: GroupProps) {
    return new GroupNode(this.Skia, props);
  }

  // Drawings
  Fill(props?: DrawingNodeProps) {
    return new FillNode(this.Skia, props);
  }

  Image(props: ImageProps) {
    return new ImageNode(this.Skia, props);
  }

  // ImageFilters
  BlurImageFilter(props: BlurImageFilterProps) {
    return new BlurImageFilterNode(this.Skia, props);
  }

  // Color Filter
  MatrixColorFilter(props: MatrixColorFilterProps) {
    return new MatrixColorFilterNode(this.Skia, props);
  }
}
