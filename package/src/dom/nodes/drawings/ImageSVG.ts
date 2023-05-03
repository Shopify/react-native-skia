import type { DrawingContext, ImageSVGProps } from "../../types";
import { NodeType } from "../../types";
import { JsiDrawingNode } from "../DrawingNode";
import type { NodeContext } from "../Node";

export class ImageSVGNode extends JsiDrawingNode<
  ImageSVGProps,
  Pick<ImageSVGProps, "x" | "y" | "width" | "height">
> {
  constructor(ctx: NodeContext, props: ImageSVGProps) {
    super(ctx, NodeType.ImageSVG, props);
  }

  deriveProps() {
    if (this.props.rect) {
      return this.props.rect;
    }
    const { x, y, width, height } = this.props;
    return { x, y, width, height };
  }

  draw({ canvas }: DrawingContext) {
    const { svg } = this.props;
    if (!this.derived) {
      throw new Error("ImageSVGNode: derived props unresolved");
    }
    const { x, y, width, height } = this.derived;
    if (svg === null) {
      return;
    }
    canvas.save();
    if (x && y) {
      canvas.translate(x, y);
    }
    canvas.drawSvg(svg, width, height);
    canvas.restore();
  }
}
