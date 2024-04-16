import type { SkJSIInstance } from "../JsiInstance";

/**
 * Represents a Skia Context for the native graphics API.
 * The context acts as an opaque pointer.
 */
export interface SkContext extends SkJSIInstance<"Context"> {
  /**
   * Returns `true` when the Skia Context is valid and can be used for rendering.
   */
  isValid(): boolean
}
