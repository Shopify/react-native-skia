import { FillType } from "../../../skia/types";
import type { SkPath, StrokeOpts, Skia } from "../../../skia/types";
import type {
  DrawingContext,
  DrawingNodeProps,
  PathDef,
  SkEnum,
} from "../../types";
import { NodeType } from "../../types";
import { enumKey, processPath } from "../datatypes";

import { JsiDrawingNode } from "./DrawingNode";

export interface PathNodeProps extends DrawingNodeProps {
  path: PathDef;
  start: number;
  end: number;
  stroke?: StrokeOpts;
  fillType?: SkEnum<typeof FillType>;
}

export class PathNode extends JsiDrawingNode<PathNodeProps> {
  private path: SkPath | null = null;

  constructor(Skia: Skia, props: PathNodeProps) {
    super(Skia, NodeType.Path, props);
    this.onPropChange();
  }

  onPropChange() {
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
    this.path = path;
  }

  draw({ canvas, paint }: DrawingContext) {
    if (this.path === null) {
      throw new Error("Path not initialized");
    }
    canvas.drawPath(this.path, paint);
  }
}
