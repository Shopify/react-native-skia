import type { ChildrenProps, DrawingContext } from "../../types";
import { DeclarationContext, NodeType } from "../../types";
import { JsiDrawingNode } from "../DrawingNode";
import type { NodeContext } from "../Node";
import { JsiDeclarationNode } from "../Node";

export class BackdropFilterNode extends JsiDrawingNode<ChildrenProps, null> {
  constructor(ctx: NodeContext, props: ChildrenProps) {
    super(ctx, NodeType.BackdropFilter, props);
  }

  protected deriveProps() {
    return null;
  }

  draw({ canvas }: DrawingContext) {
    const child = this._children[0];
    let imageFilter = null;
    if (child instanceof JsiDeclarationNode) {
      const declCtx = new DeclarationContext();
      child.decorate(declCtx);
      const imgf = declCtx.popImageFilter();
      if (imgf) {
        imageFilter = imgf;
      } else {
        const cf = declCtx.popColorFilter();
        if (cf) {
          imageFilter = this.Skia.ImageFilter.MakeColorFilter(cf, null);
        }
      }
    }
    canvas.saveLayer(undefined, null, imageFilter);
    canvas.restore();
  }
}
