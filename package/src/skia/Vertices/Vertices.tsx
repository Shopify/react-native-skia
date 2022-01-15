import type { IRect } from "../Rect";
import type { SkJSIInstance } from "../JsiInstance";

export enum VertexMode {
  Triangles,
  TrianglesStrip,
  TriangleFan,
}

export interface Vertices extends SkJSIInstance<"Vertices"> {
  /**
   * Return the bounding area for the vertices.
   * @param outputArray - if provided, the bounding box will be copied into this array instead of
   *                      allocating a new one.
   */
  bounds(outputArray?: IRect): IRect;

  /**
   * Return a unique ID for this vertices object.
   */
  uniqueID(): number;
}
