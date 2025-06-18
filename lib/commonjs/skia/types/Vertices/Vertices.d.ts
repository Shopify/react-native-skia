import type { SkRect } from "../Rect";
import type { SkJSIInstance } from "../JsiInstance";
export declare enum VertexMode {
    Triangles = 0,
    TriangleStrip = 1,
    TriangleFan = 2
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
