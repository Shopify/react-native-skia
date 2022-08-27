import type { SkPath } from "../../../skia/types";
import type { DrawingContext } from "../Node";
import { NodeType, RenderNode } from "../Node";

export interface PathNodeProps {
  path: SkPath;
}

export class PathNode extends RenderNode<PathNodeProps> {
  constructor(props: PathNodeProps) {
    super(NodeType.Path, props);
  }

  render({ canvas, paint }: DrawingContext) {
    const { path } = this.props;
    canvas.drawPath(path, paint);
  }
}
