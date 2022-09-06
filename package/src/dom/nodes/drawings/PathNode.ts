import { FillType } from "../../../skia/types";
import type { SkPath, Skia } from "../../../skia/types";
import type { DrawingContext, PathProps } from "../../types";
import { NodeType } from "../../types";
import { enumKey, processPath } from "../datatypes";
import { JsiDrawingNode } from "../DrawingNode";

export class PathNode extends JsiDrawingNode<PathProps, SkPath> {
  constructor(Skia: Skia, props: PathProps) {
    super(Skia, NodeType.Path, props);
  }

  protected deriveProps() {
    const { start, end, fillType, stroke, ...pathProps } = this.props;
    const hasStartOffset = start !== 0;
    const hasEndOffset = end !== 1;
    const hasStrokeOptions = stroke !== undefined;
    const hasFillType = !!fillType;
    const willMutatePath =
      hasStartOffset || hasEndOffset || hasStrokeOptions || hasFillType;
    const pristinePath = processPath(this.Skia, pathProps.path);
    const path = willMutatePath ? pristinePath.copy() : pristinePath;
    if (hasFillType) {
      path.setFillType(FillType[enumKey(fillType)]);
    }
    if (hasStrokeOptions) {
      path.stroke(stroke);
    }
    if (hasStartOffset || hasEndOffset) {
      path.trim(start, end, false);
    }
    return path;
  }

  draw({ canvas, paint }: DrawingContext) {
    if (!this.derived) {
      throw new Error("Path not initialized");
    }
    canvas.drawPath(this.derived, paint);
  }
}
