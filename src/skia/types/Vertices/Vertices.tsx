import type { SkRect } from "../Rect";
import type { SkJSIInstance } from "../JsiInstance";

export enum VertexMode {
  Triangles,
  TriangleStrip,
  TriangleFan,
}

export interface SkVertices extends SkJSIInstance<"Vertices"> {
  /**
   * Return the bounding area for the vertices.
   */
  bounds(): SkRect;

  /**
   * Return a unique ID for this vertices object.
   */
  uniqueID(): number;
}
