import type { Skia } from "../../../skia/types";
import type { DrawingContext, ImageSVGProps } from "../../types";
import { NodeType } from "../../types";
import { processRect } from "../datatypes";
import { JsiDrawingNode } from "../DrawingNode";

export class ImageSVGNode extends JsiDrawingNode<ImageSVGProps> {
  constructor(Skia: Skia, props: ImageSVGProps) {
    super(Skia, NodeType.ImageSVG, props);
  }

  onPropChange() {}

  draw({ canvas }: DrawingContext) {
    const { svg } = this.props;
    const { x, y, width, height } = processRect(this.Skia, this.props);
    canvas.save();
    canvas.translate(x, y);
    canvas.drawSvg(svg, width, height);
    canvas.restore();
  }
}
