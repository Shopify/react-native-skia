import type { SkPath } from "../../../skia/types";
import type { DrawingContext } from "../Node";
import { NodeType } from "../Node";

import type { DrawingNodeProps } from "./DrawingNode";
import { DrawingNode } from "./DrawingNode";

export interface PathNodeProps extends DrawingNodeProps {
  path: SkPath;
}

export class PathNode extends DrawingNode<PathNodeProps> {
  constructor(props: PathNodeProps) {
    super(NodeType.Path, props);
  }

  draw({ canvas, paint }: DrawingContext) {
    const { path } = this.props;
    canvas.drawPath(path, paint);
  }
}
