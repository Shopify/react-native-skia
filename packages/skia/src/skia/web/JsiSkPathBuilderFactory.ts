import type { SkPath } from "../types";
import type { PathBuilderFactory, SkPathBuilder } from "../types/PathBuilder";

import { throwNotImplementedOnRNWeb } from "./Host";

export class JsiSkPathBuilderFactory implements PathBuilderFactory {
  constructor() {}

  Make(): SkPathBuilder {
    return throwNotImplementedOnRNWeb<SkPathBuilder>();
  }

  MakeFromPath(_path: SkPath): SkPathBuilder {
    return throwNotImplementedOnRNWeb<SkPathBuilder>();
  }
}
