import type { BlendMode, SkVertices } from "../../../skia/types";
import type { DrawingContext } from "../Node";
import { NodeType, RenderNode } from "../Node";

export interface VerticesNodeProps {
  vertices: SkVertices;
  mode: BlendMode;
}

export class VerticesNode extends RenderNode<VerticesNodeProps> {
  constructor(props: VerticesNodeProps) {
    super(NodeType.Vertices, props);
  }

  render({ canvas, paint }: DrawingContext) {
    const { vertices, mode } = this.props;
    canvas.drawVertices(vertices, mode, paint);
  }
}
