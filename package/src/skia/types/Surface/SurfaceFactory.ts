import type { SkSurface } from "./Surface";

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
   */
  MakeOffscreen: (width: number, height: number) => SkSurface | null;
}
