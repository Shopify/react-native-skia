import type { IImage } from "../Image";
import type { ICanvas } from "../Canvas";
import type { SkJSIInstance } from "../JsiInstance";

export interface ISurface extends SkJSIInstance<"Surface"> {
  /** Returns SkCanvas that draws into SkSurface. Subsequent calls return the
     same SkCanvas. SkCanvas returned is managed and owned by SkSurface, and is
     deleted when SkSurface is deleted.

      @return  drawing SkCanvas for SkSurface

      example: https://fiddle.skia.org/c/@Surface_getCanvas
  */
  getCanvas(): ICanvas;

  /** Returns SkImage capturing SkSurface contents. Subsequent drawing to
     SkSurface contents are not captured. SkImage allocation is accounted for if
     SkSurface was created with SkBudgeted::kYes.

      @return  SkImage initialized with SkSurface contents

      example: https://fiddle.skia.org/c/@Surface_makeImageSnapshot
  */
  makeImageSnapshot(): IImage;
}
