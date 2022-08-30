import type { DrawingContext, DrawingNodeProps } from "../Node";
import { NodeType, DrawingNode } from "../Node";
import type { SkImage, SkRect } from "../../../skia/types";

interface ImageNodeProps extends DrawingNodeProps {
  image: SkImage;
  src: SkRect;
  dst: SkRect;
}

export class ImageNode extends DrawingNode<ImageNodeProps> {
  constructor(props: ImageNodeProps) {
    super(NodeType.Image, props);
  }

  draw({ canvas, paint }: DrawingContext) {
    const { image, src, dst } = this.props;
    canvas.drawImageRect(image, src, dst, paint);
  }
}
