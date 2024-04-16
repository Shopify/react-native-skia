import type { SkContext } from "./Context";

export interface ContextFactory {
  /**
   * Creates a new Skia Context.
   */
  Make: () => SkContext;
  /**
   * Gets the global Skia Context for this JS Runtime.
   * Different JS Runtimes have different global Skia Contexts.
   */
  GetCurrent: () => SkContext;
}
