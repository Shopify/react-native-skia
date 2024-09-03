import { BlendMode } from "../../../skia/types";
import type { AtlasProps, DrawingContext } from "../../types";
import { NodeType } from "../../types";
import { JsiDrawingNode } from "../DrawingNode";
import type { NodeContext } from "../Node";
import { enumKey } from "../datatypes";

export class AtlasNode extends JsiDrawingNode<AtlasProps, null> {
  protected deriveProps() {
    return null;
  }

  constructor(ctx: NodeContext, props: AtlasProps) {
    super(ctx, NodeType.Atlas, props);
  }

  draw({ canvas, paint }: DrawingContext) {
    const { image, sprites, transforms, colors, blendMode } = this.props;
    const blend = blendMode ? BlendMode[enumKey(blendMode)] : undefined;
    if (image) {
      canvas.drawAtlas(image, sprites, transforms, paint, blend, colors);
    }
  }
}
