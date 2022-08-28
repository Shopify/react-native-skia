import type { SkColorFilter, Skia } from "../../../skia/types";
import { DeclarationNode, NodeType } from "../Node";

export interface MatrixColorFilterNodeProps {
  colorMatrix: number[];
}

export class MatrixColorFilterNode extends DeclarationNode<
  MatrixColorFilterNodeProps,
  SkColorFilter
> {
  constructor(props: MatrixColorFilterNodeProps) {
    super(NodeType.DashPathEffect, props);
  }

  get(Skia: Skia) {
    const { colorMatrix } = this.props;
    return Skia.ColorFilter.MakeMatrix(colorMatrix);
  }
}
