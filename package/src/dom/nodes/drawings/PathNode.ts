import type { SkPath } from "../../../skia/types";
import type { DrawingContext, DrawingNodeProps } from "../Node";
import { NodeType, DrawingNode } from "../Node";

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
