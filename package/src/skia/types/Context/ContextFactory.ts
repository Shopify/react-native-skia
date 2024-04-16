import type { SkContext } from "./Context";

export interface ContextFactory {
  /**
   * Creates a new Skia Context.
   */
  Make: () => SkContext;
}
