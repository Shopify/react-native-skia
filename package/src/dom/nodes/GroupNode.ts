import type { SkMatrix, SkShader } from "../../skia/types";
import type { SkMaskFilter } from "../../skia/types/MaskFilter";

import type { DeclarationNode, DrawingContext } from "./Node";
import { RenderNode, NodeType } from "./Node";
import type { PaintNodeProps } from "./paint/PaintNode";
import { PaintNode } from "./paint/PaintNode";

interface GroupNodeProps {
  matrix?: SkMatrix;
  paint?: PaintNodeProps;
}

export class GroupNode extends RenderNode<GroupNodeProps> {
  paint?: PaintNode;
  children: RenderNode<unknown>[] = [];

  constructor(props: GroupNodeProps = {}) {
    super(NodeType.Group, props);
    if (props.paint) {
      this.paint = new PaintNode(props.paint);
    }
  }

  addChild(child: RenderNode<unknown>) {
    this.children.push(child);
  }

  addShader(shader: DeclarationNode<unknown, SkShader>) {
    if (!this.paint) {
      this.paint = new PaintNode();
    }
    this.paint.addShader(shader);
  }

  addMaskFilter(maskFilter: DeclarationNode<unknown, SkMaskFilter>) {
    if (!this.paint) {
      this.paint = new PaintNode();
    }
    this.paint.addMaskFilter(maskFilter);
  }

  render(parentCtx: DrawingContext) {
    const { canvas } = parentCtx;
    const paint = this.paint
      ? this.paint.concat(parentCtx.Skia, parentCtx.paint, parentCtx.opacity)
      : parentCtx.paint;

    const ctx = parentCtx.paint === paint ? parentCtx : { ...parentCtx, paint };
    if (this.props.matrix) {
      canvas.save();
      canvas.concat(this.props.matrix);
    }
    this.children.forEach((child) => child.render(ctx));
    if (this.props.matrix) {
      canvas.restore();
    }
  }
}
