import type { AndroidSurfaceType } from "./types";

// Anything else reaching the native component would hit the generated
// string-enum parser, which aborts on unknown values.
export const resolveSurfaceType = (
  surfaceType: AndroidSurfaceType | undefined
): "auto" | AndroidSurfaceType =>
  surfaceType === "SurfaceView" || surfaceType === "TextureView"
    ? surfaceType
    : "auto";
