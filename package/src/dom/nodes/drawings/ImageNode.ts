import type { Skia, SkRect } from "../../../skia/types";
import type { DrawingContext, ImageProps } from "../../types";
import { NodeType } from "../../types";
import { fitRects, processRect } from "../datatypes";
import { JsiDrawingNode } from "../DrawingNode";

export class ImageNode extends JsiDrawingNode<
  ImageProps,
  { src: SkRect; dst: SkRect }
> {
  constructor(Skia: Skia, props: ImageProps) {
    super(Skia, NodeType.Image, props);
  }

  deriveProps() {
    const { image, fit } = this.props;
    const rect = processRect(this.Skia, this.props);
    const { src, dst } = fitRects(
      fit,
      {
        x: 0,
        y: 0,
        width: image.width(),
        height: image.height(),
      },
      rect
    );
    return { src, dst };
  }

  draw({ canvas, paint }: DrawingContext) {
    const { image } = this.props;
    if (!this.derived) {
      throw new Error("ImageNode: src and dst are undefined");
    }
    const { src, dst } = this.derived;
    canvas.drawImageRect(image, src, dst, paint);
  }
}
