import type { Skia } from "../../skia/types";
import type { SkDOM, GroupProps, ImageProps } from "../types";
import type { DrawingNodeProps } from "../types/Node";

import { FillNode, ImageNode } from "./drawings";
import { GroupNode } from "./GroupNode";

export class JsiSkDOM implements SkDOM {
  constructor(private Skia: Skia) {}

  Group(props?: GroupProps) {
    return new GroupNode(this.Skia, props);
  }

  Fill(props?: DrawingNodeProps) {
    return new FillNode(this.Skia, props);
  }

  Image(props: ImageProps) {
    return new ImageNode(this.Skia, props);
  }
}
