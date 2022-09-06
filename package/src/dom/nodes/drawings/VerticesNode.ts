import type { SkVertices, Skia } from "../../../skia/types";
import { VertexMode, BlendMode } from "../../../skia/types";
import type { DrawingContext, VerticesProps } from "../../types";
import { NodeType } from "../../types";
import { enumKey, processColor } from "../datatypes";
import { JsiDrawingNode } from "../DrawingNode";

export class VerticesNode extends JsiDrawingNode<VerticesProps> {
  vertices?: SkVertices;

  constructor(Skia: Skia, props: VerticesProps) {
    super(Skia, NodeType.Vertices, props);
    this.onPropChange();
  }

  onPropChange() {
    const { mode, vertices, textures, colors, indices } = this.props;
    const vertexMode = mode ? VertexMode[enumKey(mode)] : VertexMode.Triangles;
    this.vertices = this.Skia.MakeVertices(
      vertexMode,
      vertices,
      textures,
      colors ? colors.map((c) => processColor(this.Skia, c, 1)) : undefined,
      indices
    );
  }

  draw({ canvas, paint }: DrawingContext) {
    const { colors, blendMode } = this.props;
    const defaultBlendMode = colors ? BlendMode.DstOver : BlendMode.SrcOver;
    const blend = blendMode ? BlendMode[enumKey(blendMode)] : defaultBlendMode;
    if (this.vertices === undefined) {
      throw new Error("VerticesNode: vertices is undefined");
    }
    canvas.drawVertices(this.vertices, blend, paint);
  }
}
