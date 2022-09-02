import type { BlendMode, Skia, SkVertices } from "../../../skia/types";
import type { DrawingContext, DrawingNodeProps } from "../../types";
import { NodeType } from "../../types";

import { JsiDrawingNode } from "./DrawingNode";

export interface VerticesNodeProps extends DrawingNodeProps {
  vertices: SkVertices;
  mode: BlendMode;
}

export class VerticesNode extends JsiDrawingNode<VerticesNodeProps> {
  constructor(Skia: Skia, props: VerticesNodeProps) {
    super(Skia, NodeType.Vertices, props);
  }

  onPropChange() {}

  draw({ canvas, paint }: DrawingContext) {
    const { vertices, mode } = this.props;
    canvas.drawVertices(vertices, mode, paint);
  }
}
