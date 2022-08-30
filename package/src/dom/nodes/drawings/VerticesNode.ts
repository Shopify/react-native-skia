import type { BlendMode, SkVertices } from "../../../skia/types";
import type { DrawingContext, DrawingNodeProps } from "../Node";
import { NodeType, DrawingNode } from "../Node";

export interface VerticesNodeProps extends DrawingNodeProps {
  vertices: SkVertices;
  mode: BlendMode;
}

export class VerticesNode extends DrawingNode<VerticesNodeProps> {
  constructor(props: VerticesNodeProps) {
    super(NodeType.Vertices, props);
  }

  draw({ canvas, paint }: DrawingContext) {
    const { vertices, mode } = this.props;
    canvas.drawVertices(vertices, mode, paint);
  }
}
