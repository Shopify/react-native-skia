import { Path1DEffectStyle } from "../../../skia/types";
import type { Skia, SkPathEffect } from "../../../skia/types";
import { JsiNestedDeclarationNode } from "../Node";
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

export class DiscretePathEffectNode extends JsiNestedDeclarationNode<
  DiscretePathEffectProps,
  SkPathEffect
> {
  constructor(Skia: Skia, props: DiscretePathEffectProps) {
    super(Skia, DeclarationType.PathEffect, NodeType.DiscretePathEffect, props);
  }

  get() {
    // TODO: compose children
    const { length, deviation, seed } = this.props;
    return this.Skia.PathEffect.MakeDiscrete(length, deviation, seed);
  }
}

export class Path2DPathEffectNode extends JsiNestedDeclarationNode<
  Path2DPathEffectProps,
  SkPathEffect,
  SkPathEffect,
  null
> {
  constructor(Skia: Skia, props: Path2DPathEffectProps) {
    super(Skia, DeclarationType.PathEffect, NodeType.Path2DPathEffect, props);
  }

  get() {
    // TODO: compose children
    const { matrix } = this.props;
    const path = processPath(this.Skia, this.props.path);
    return this.Skia.PathEffect.MakePath2D(matrix, path);
  }
}

export class DashPathEffectNode extends JsiNestedDeclarationNode<
  DashPathEffectProps,
  SkPathEffect
> {
  constructor(Skia: Skia, props: DashPathEffectProps) {
    super(Skia, DeclarationType.PathEffect, NodeType.DashPathEffect, props);
  }

  get() {
    const { intervals, phase } = this.props;
    // TODO: compose children
    return this.Skia.PathEffect.MakeDash(intervals, phase);
  }
}

export class CornerPathEffectNode extends JsiNestedDeclarationNode<
  CornerPathEffectProps,
  SkPathEffect,
  SkPathEffect,
  null
> {
  constructor(Skia: Skia, props: CornerPathEffectProps) {
    super(Skia, DeclarationType.PathEffect, NodeType.CornerPathEffect, props);
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

export class SumPathEffectNode extends JsiNestedDeclarationNode<
  null,
  SkPathEffect
> {
  constructor(Skia: Skia) {
    super(Skia, DeclarationType.PathEffect, NodeType.SumPathEffect, null);
  }

  get() {
    // TODO: compose children
    return this.getRecursively(
      this.Skia.PathEffect.MakeSum.bind(this.Skia.PathEffect)
    );
  }
}

export class Line2DPathEffectNode extends JsiNestedDeclarationNode<
  Line2DPathEffectProps,
  SkPathEffect,
  SkPathEffect,
  null
> {
  constructor(Skia: Skia, props: Line2DPathEffectProps) {
    super(Skia, DeclarationType.PathEffect, NodeType.Line2DPathEffect, props);
  }

  get() {
    const { width, matrix } = this.props;
    // TODO: compose children
    return this.Skia.PathEffect.MakeLine2D(width, matrix);
  }
}

export class Path1DPathEffectNode extends JsiNestedDeclarationNode<
  Path1DPathEffectProps,
  SkPathEffect,
  SkPathEffect,
  null
> {
  constructor(Skia: Skia, props: Path1DPathEffectProps) {
    super(Skia, DeclarationType.PathEffect, NodeType.Path1DPathEffect, props);
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
