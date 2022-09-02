import type { Skia } from "../../skia/types";
import type { SkDOM, GroupProps } from "../types";

import { GroupNode } from "./GroupNode";

export class JsiSkDOM implements SkDOM {
  constructor(private Skia: Skia) {}

  Group(props?: GroupProps) {
    return new GroupNode(this.Skia, props);
  }
}
