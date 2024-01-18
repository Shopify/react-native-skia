import type { AtlasProps, DrawingContext } from "../../types";
import { NodeType } from "../../types";
import { JsiDrawingNode } from "../DrawingNode";
import type { NodeContext } from "../Node";

export class AtlasNode extends JsiDrawingNode<AtlasProps, null> {
  protected deriveProps() {
    return null;
  }

  constructor(ctx: NodeContext, props: AtlasProps) {
    super(ctx, NodeType.Atlas, props);
  }

  draw({ canvas, paint }: DrawingContext) {
    const { image, sprites, transforms } = this.props;
    if (this.derived === undefined) {
      throw new Error("RRectNode: rect is undefined");
    }
    canvas.drawAtlas(image, sprites, transforms, paint);
  }
}
