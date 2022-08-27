import type { DrawingContext } from "../Node";
import { NodeType, RenderNode } from "../Node";
import type { SkImage, SkRect } from "../../../skia/types";

interface ImageNodeProps {
  image: SkImage;
  src: SkRect;
  dst: SkRect;
}

export class ImageNode extends RenderNode<ImageNodeProps> {
  constructor(props: ImageNodeProps) {
    super(NodeType.Image, props);
  }

  render({ canvas, paint }: DrawingContext) {
    const { image, src, dst } = this.props;
    canvas.drawImageRect(image, src, dst, paint);
  }
}
