import type { ChildrenProps, DrawingContext } from "../../types";
import { NodeType } from "../../types";
import { JsiDrawingNode } from "../DrawingNode";
import type { NodeContext } from "../Node";
import { JsiDeclarationNode } from "../Node";
import type { SkImageFilter } from "../../../skia/types/ImageFilter/ImageFilter";

export class BackdropFilterNode extends JsiDrawingNode<ChildrenProps, null> {
  constructor(ctx: NodeContext, props: ChildrenProps) {
    super(ctx, NodeType.BackdropFilter, props);
  }

  protected deriveProps() {
    return null;
  }

  draw({ canvas, declarationCtx }: DrawingContext) {
    const child = this._children[0];
    let imageFilter: SkImageFilter | null = null;
    if (child instanceof JsiDeclarationNode) {
      declarationCtx.save();
      child.decorate(declarationCtx);
      const imgf = declarationCtx.imageFilters.pop();
      if (imgf) {
        imageFilter = imgf;
      } else {
        const cf = declarationCtx.colorFilters.pop();
        if (cf) {
          imageFilter = this.Skia.ImageFilter.MakeColorFilter(cf, null);
        }
      }
      declarationCtx.restore();
    }
    canvas.saveLayer(undefined, null, imageFilter);
    canvas.restore();
  }
}
