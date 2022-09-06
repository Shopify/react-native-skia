import { Path1DEffectStyle } from "../../../skia/types";
import type { Skia, SkPathEffect } from "../../../skia/types";
import { JsiDeclarationNode } from "../Node";
import type {
  CornerPathEffectProps,
  DashPathEffectProps,
  DiscretePathEffectProps,
  Line2DPathEffectProps,
  Path1DPathEffectProps,
  Path2DPathEffectProps,
} from "../../types";
import { DeclarationType, NodeType } from "../../types";
import { enumKey } from "../datatypes/Enum";
import { processPath } from "../datatypes";

abstract class PathEffectDeclaration<
  P,
  Nullable extends null | never = never
> extends JsiDeclarationNode<P, SkPathEffect, Nullable> {
  constructor(Skia: Skia, type: NodeType, props: P) {
    super(Skia, DeclarationType.PathEffect, type, props);
  }

  getOptionalChildInstance(index: number) {
    const child = this._children[index];
    if (!child) {
      return null;
    }
    return this.getMandatoryChildInstance(index);
  }

  getMandatoryChildInstance(index: number) {
    const child = this._children[index];
    if (child instanceof JsiDeclarationNode) {
      if (child.isPathEffect()) {
        return child.get();
      } else {
        throw new Error(`Found invalid child ${child.type} in ${this.type}`);
      }
    } else {
      throw new Error(`Found invalid child ${child.type} in ${this.type}`);
    }
  }
}

export class DiscretePathEffectNode extends PathEffectDeclaration<DiscretePathEffectProps> {
  constructor(Skia: Skia, props: DiscretePathEffectProps) {
    super(Skia, NodeType.DiscretePathEffect, props);
  }

  get() {
    // TODO: compose children
    const { length, deviation, seed } = this.props;
    return this.Skia.PathEffect.MakeDiscrete(length, deviation, seed);
  }
}

export class Path2DPathEffectNode extends PathEffectDeclaration<
  Path2DPathEffectProps,
  null
> {
  constructor(Skia: Skia, props: Path2DPathEffectProps) {
    super(Skia, NodeType.Path2DPathEffect, props);
  }

  get() {
    // TODO: compose children
    const { matrix } = this.props;
    const path = processPath(this.Skia, this.props.path);
    return this.Skia.PathEffect.MakePath2D(matrix, path);
  }
}

export class DashPathEffectNode extends PathEffectDeclaration<DashPathEffectProps> {
  constructor(Skia: Skia, props: DashPathEffectProps) {
    super(Skia, NodeType.DashPathEffect, props);
  }

  get() {
    const { intervals, phase } = this.props;
    // TODO: compose children
    return this.Skia.PathEffect.MakeDash(intervals, phase);
  }
}

export class CornerPathEffectNode extends PathEffectDeclaration<
  CornerPathEffectProps,
  null
> {
  constructor(Skia: Skia, props: CornerPathEffectProps) {
    super(Skia, NodeType.CornerPathEffect, props);
  }

  get() {
    const { r } = this.props;
    // TODO: compose children
    return this.Skia.PathEffect.MakeCorner(r);
  }
}

// export class ComposePathEffectNode extends JsiNestedDeclarationNode<
//   null,
//   SkPathEffect
// > {
//   constructor(Skia: Skia) {
//     super(Skia, DeclarationType.PathEffect, NodeType.ComposePathEffect, null);
//   }

//   get() {
//     // TODO: compose children
//     return this.getRecursively(
//       this.Skia.PathEffect.MakeCompose.bind(this.Skia.PathEffect)
//     );
//   }
// }

export class SumPathEffectNode extends PathEffectDeclaration<null> {
  constructor(Skia: Skia) {
    super(Skia, NodeType.SumPathEffect, null);
  }

  get() {
    // TODO: compose children
    return this.Skia.PathEffect.MakeSum(
      this.getMandatoryChildInstance(0),
      this.getMandatoryChildInstance(1)
    );
  }
}

export class Line2DPathEffectNode extends PathEffectDeclaration<
  Line2DPathEffectProps,
  null
> {
  constructor(Skia: Skia, props: Line2DPathEffectProps) {
    super(Skia, NodeType.Line2DPathEffect, props);
  }

  get() {
    const { width, matrix } = this.props;
    // TODO: compose children
    return this.Skia.PathEffect.MakeLine2D(width, matrix);
  }
}

export class Path1DPathEffectNode extends PathEffectDeclaration<
  Path1DPathEffectProps,
  null
> {
  constructor(Skia: Skia, props: Path1DPathEffectProps) {
    super(Skia, NodeType.Path1DPathEffect, props);
  }

  get() {
    const { advance, phase, style } = this.props;
    const path = processPath(this.Skia, this.props.path);
    // TODO: compose children
    return this.Skia.PathEffect.MakePath1D(
      path,
      advance,
      phase,
      Path1DEffectStyle[enumKey(style)]
    );
  }
}
