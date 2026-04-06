import type { SkSurface } from "./Surface";

export const ColorSpace = {
  SRGB: "srgb",
  DisplayP3: "display-p3",
} as const;

export type ColorSpaceValue = (typeof ColorSpace)[keyof typeof ColorSpace];

export interface SurfaceOptions {
  colorSpace: ColorSpaceValue;
}

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
   * @param opts - optional surface options (e.g. colorSpace: "display-p3" | "srgb").
   */
  MakeOffscreen: (
    width: number,
    height: number,
    opts?: SurfaceOptions
  ) => SkSurface | null;
}
