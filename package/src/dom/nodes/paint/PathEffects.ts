import type {
  Skia,
  Path1DEffectStyle,
  SkMatrix,
  SkPath,
  SkPathEffect,
} from "../../../skia/types";
import { JsiDeclarationNode, JsiNestedDeclarationNode } from "../Node";
import { DeclarationType, NodeType } from "../types";
export interface DiscretePathEffectNodeProps {
  segLength: number;
  dev: number;
  seedAssist: number;
}

export class DiscretePathEffectNode extends JsiDeclarationNode<
  DiscretePathEffectNodeProps,
  SkPathEffect
> {
  constructor(Skia: Skia, props: DiscretePathEffectNodeProps) {
    super(Skia, DeclarationType.PathEffect, NodeType.DiscretePathEffect, props);
  }

  get() {
    const { segLength, dev, seedAssist } = this.props;
    return this.Skia.PathEffect.MakeDiscrete(segLength, dev, seedAssist);
  }
}

export interface Path2DEffectNodeProps {
  matrix: SkMatrix;
  path: SkPath;
}

export class Path2DPathEffectNode extends JsiDeclarationNode<
  Path2DEffectNodeProps,
  SkPathEffect,
  null
> {
  constructor(Skia: Skia, props: Path2DEffectNodeProps) {
    super(Skia, DeclarationType.PathEffect, NodeType.Path2DPathEffect, props);
  }

  get() {
    const { matrix, path } = this.props;
    return this.Skia.PathEffect.MakePath2D(matrix, path);
  }
}

export interface DashPathEffectNodeProps {
  intervals: number[];
  phase?: number;
}

export class DashPathEffectNode extends JsiDeclarationNode<
  DashPathEffectNodeProps,
  SkPathEffect
> {
  constructor(Skia: Skia, props: DashPathEffectNodeProps) {
    super(Skia, DeclarationType.PathEffect, NodeType.DashPathEffect, props);
  }

  get() {
    const { intervals, phase } = this.props;
    return this.Skia.PathEffect.MakeDash(intervals, phase);
  }
}

export interface CornerPathEffectNodeProps {
  radius: number;
}

export class CornerPathEffectNode extends JsiDeclarationNode<
  CornerPathEffectNodeProps,
  SkPathEffect,
  null
> {
  constructor(Skia: Skia, props: CornerPathEffectNodeProps) {
    super(Skia, DeclarationType.PathEffect, NodeType.CornerPathEffect, props);
  }

  get() {
    const { radius } = this.props;
    return this.Skia.PathEffect.MakeCorner(radius);
  }
}

export class ComposePathEffectNode extends JsiNestedDeclarationNode<
  null,
  SkPathEffect
> {
  constructor(Skia: Skia) {
    super(Skia, DeclarationType.PathEffect, NodeType.ComposePathEffect, null);
  }

  get() {
    return this.getRecursively(
      this.Skia.PathEffect.MakeCompose.bind(this.Skia.PathEffect)
    );
  }
}

export class SumPathEffectNode extends JsiNestedDeclarationNode<
  null,
  SkPathEffect
> {
  constructor(Skia: Skia) {
    super(Skia, DeclarationType.PathEffect, NodeType.SumPathEffect, null);
  }

  get() {
    return this.getRecursively(
      this.Skia.PathEffect.MakeSum.bind(this.Skia.PathEffect)
    );
  }
}

export interface Line2DPathEffectNodeProps {
  width: number;
  matrix: SkMatrix;
}

export class Line2DPathEffectNode extends JsiDeclarationNode<
  Line2DPathEffectNodeProps,
  SkPathEffect,
  null
> {
  constructor(Skia: Skia, props: Line2DPathEffectNodeProps) {
    super(Skia, DeclarationType.PathEffect, NodeType.Line2DPathEffect, props);
  }

  get() {
    const { width, matrix } = this.props;
    return this.Skia.PathEffect.MakeLine2D(width, matrix);
  }
}

export interface Path1DPathEffectNodeProps {
  path: SkPath;
  advance: number;
  phase: number;
  style: Path1DEffectStyle;
}

export class Path1DPathEffectNode extends JsiDeclarationNode<
  Path1DPathEffectNodeProps,
  SkPathEffect,
  null
> {
  constructor(Skia: Skia, props: Path1DPathEffectNodeProps) {
    super(Skia, DeclarationType.PathEffect, NodeType.Path1DPathEffect, props);
  }

  get() {
    const { path, advance, phase, style } = this.props;
    return this.Skia.PathEffect.MakePath1D(path, advance, phase, style);
  }
}
