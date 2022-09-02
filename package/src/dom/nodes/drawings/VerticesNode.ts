import type { BlendMode, Skia, SkVertices } from "../../../skia/types";
import type { DrawingContext } from "../types";
import { NodeType } from "../types";

import type { DrawingNodeProps } from "./DrawingNode";
import { DrawingNode } from "./DrawingNode";

export interface VerticesNodeProps extends DrawingNodeProps {
  vertices: SkVertices;
  mode: BlendMode;
}

export class VerticesNode extends DrawingNode<VerticesNodeProps> {
  constructor(Skia: Skia, props: VerticesNodeProps) {
    super(Skia, NodeType.Vertices, props);
  }

  onPropChange() {}

  draw({ canvas, paint }: DrawingContext) {
    const { vertices, mode } = this.props;
    canvas.drawVertices(vertices, mode, paint);
  }
}
