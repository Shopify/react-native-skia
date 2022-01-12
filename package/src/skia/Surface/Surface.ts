import type { IImage } from "../Image";
import type { ICanvas } from "../Canvas";
import type { SkJSIInstance } from "../JsiInstance";

export interface ISurface extends SkJSIInstance<"Surface"> {
  /** Returns Canvas that draws into the surface. Subsequent calls return the
     same Canvas. Canvas returned is managed and owned by Surface, and is
     deleted when Surface is deleted.

      @return  drawing Canvas for Surface

      example: https://fiddle.skia.org/c/@Surface_getCanvas
  */
  getCanvas(): ICanvas;

  /** Returns Image capturing Surface contents. Subsequent drawing to
     Surface contents are not captured.

      @return  Image initialized with Surface contents

      example: https://fiddle.skia.org/c/@Surface_makeImageSnapshot
  */
  makeImageSnapshot(): IImage;
}
