import type { SkPath } from "../Path/Path";

import type { SkPathBuilder } from "./PathBuilder";

export interface PathBuilderFactory {
  /**
   * Creates an empty PathBuilder with default fill type (Winding).
   */
  Make(): SkPathBuilder;

  /**
   * Creates a PathBuilder pre-populated with all verbs from an existing Path.
   * The fill type is copied from the source path.
   * @param path - The source path to initialize the builder with.
   */
  MakeFromPath(path: SkPath): SkPathBuilder;
}
