import type { Skia } from "../../../skia/types";
import type { DrawingContext, PictureProps } from "../../types";
import { NodeType } from "../../types";
import { JsiDrawingNode } from "../DrawingNode";

export class PictureNode extends JsiDrawingNode<PictureProps, null> {
  constructor(Skia: Skia, props: PictureProps) {
    super(Skia, NodeType.Picture, props);
  }

  deriveProps() {
    return null;
  }

  draw({ canvas }: DrawingContext) {
    const { picture } = this.props;
    canvas.drawPicture(picture);
  }
}
