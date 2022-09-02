import type { Skia, SkImage, SkRect } from "../../../skia/types";
import type { DrawingContext } from "../../types";
import { NodeType } from "../../types";

import type { DrawingNodeProps } from "./DrawingNode";
import { DrawingNode } from "./DrawingNode";

interface ImageNodeProps extends DrawingNodeProps {
  image: SkImage;
  src: SkRect;
  dst: SkRect;
}

export class ImageNode extends DrawingNode<ImageNodeProps> {
  constructor(Skia: Skia, props: ImageNodeProps) {
    super(Skia, NodeType.Image, props);
  }

  onPropChange() {}

  draw({ canvas, paint }: DrawingContext) {
    const { image, src, dst } = this.props;
    canvas.drawImageRect(image, src, dst, paint);
  }
}
