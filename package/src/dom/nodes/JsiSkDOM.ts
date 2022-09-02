import type { Skia } from "../../skia/types";

import type { SkDOM } from "./types/SkDOM";
import type { GroupNodeProps } from "./GroupNode";
import { GroupNode } from "./GroupNode";

export class JsiSkDOM implements SkDOM {
  constructor(private Skia: Skia) {}

  Group(props: GroupNodeProps) {
    return new GroupNode(this.Skia, props);
  }
}
