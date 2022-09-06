import type { Skia } from "../../../skia/types";
import { isColorFilter } from "../../../skia/types";
import type { DrawingContext } from "../../types";
import { NodeType } from "../../types";
import { JsiDrawingNode } from "../DrawingNode";
import { JsiDeclarationNode } from "../Node";
import type { ChildrenProps } from "../../../../lib/typescript/src/renderer/processors/Paint";

export class BackdropFilterNode extends JsiDrawingNode<ChildrenProps, null> {
  constructor(Skia: Skia, props: ChildrenProps) {
    super(Skia, NodeType.BackdropFilter, props);
  }

  protected deriveProps() {
    return null;
  }

  draw({ canvas }: DrawingContext) {
    const child = this._children[0];
    const filter = child instanceof JsiDeclarationNode ? child.get() : null;
    canvas.saveLayer(
      undefined,
      null,
      isColorFilter(filter)
        ? this.Skia.ImageFilter.MakeColorFilter(filter, null)
        : filter
    );
    canvas.restore();
  }
}
