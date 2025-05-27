import type { SkSurface } from "./Surface";
import type { ColorType } from "../Image/ColorType";

export interface SurfaceFactory {
  /**
   * Returns a CPU backed surface with the given dimensions, an SRGB colorspace, Unpremul
   * alphaType and 8888 color type. The pixels belonging to this surface  will be in memory and
   * not visible.
   * @param width - number of pixels of the width of the drawable area.
   * @param height - number of pixels of the height of the drawable area.
   */
  Make: (width: number, height: number) => SkSurface | null;

  /**
   * Creates a GPU backed surface.
   * @param width - number of pixels of the width of the drawable area.
   * @param height - number of pixels of the height of the drawable area.
   * @param colorType - color type for the surface (optional, defaults to RGBA_8888)
   */
  MakeOffscreen: (width: number, height: number, colorType?: ColorType) => SkSurface | null;
}
