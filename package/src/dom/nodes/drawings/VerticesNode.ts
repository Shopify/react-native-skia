import type { BlendMode, SkVertices } from "../../../skia/types";
import type { DrawingContext } from "../Node";
import { NodeType } from "../Node";

import type { DrawingNodeProps } from "./DrawingNode";
import { DrawingNode } from "./DrawingNode";

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
