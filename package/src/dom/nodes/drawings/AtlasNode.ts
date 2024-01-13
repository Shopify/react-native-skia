import type { SkRect, SkRSXform } from "../../../skia/types";
import type { AtlasProps, DrawingContext } from "../../types";
import { NodeType } from "../../types";
import { JsiDrawingNode } from "../DrawingNode";
import type { NodeContext } from "../Node";

interface AtlasParams {
  rects: SkRect[];
  transforms: SkRSXform[];
}

export class AtlasNode extends JsiDrawingNode<AtlasProps, AtlasParams> {
  constructor(ctx: NodeContext, props: AtlasProps) {
    super(ctx, NodeType.Atlas, props);
  }

  protected deriveProps() {
    const width = this.props.image.width();
    const height = this.props.image.height();
    return {
      rects: this.props.rects.map(({ rect }) =>
        !rect ? this.Skia.XYWHRect(0, 0, width, height) : rect
      ),
      transforms: this.props.rects.map(({ transform }) =>
        !transform ? this.Skia.RSXform(1, 0, 0, 0) : transform
      ),
    };
  }

  draw({ canvas, paint }: DrawingContext) {
    const { image } = this.props;
    if (this.derived === undefined) {
      throw new Error("RRectNode: rect is undefined");
    }
    canvas.drawAtlas(image, this.derived.rects, this.derived.transforms, paint);
  }
}
