import type { IRect } from "../Rect";
import type { SkJSIInstance } from "../JsiInstance";

export enum VertexMode {
  Triangles,
  TrianglesStrip,
  TriangleFan,
}

export interface IVertices extends SkJSIInstance<"Vertices"> {
  /**
   * Return the bounding area for the vertices.
   */
  bounds(): IRect;

  /**
   * Return a unique ID for this vertices object.
   */
  uniqueID(): number;
}
