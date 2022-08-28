import type {
  Path1DEffectStyle,
  Skia,
  SkMatrix,
  SkPath,
  SkPathEffect,
} from "../../../skia/types";
import { DeclarationNode, NodeType } from "../Node";

export interface DiscretePathEffectNodeProps {
  segLength: number;
  dev: number;
  seedAssist: number;
}

export class DiscretePathEffectNode extends DeclarationNode<
  DiscretePathEffectNodeProps,
  SkPathEffect
> {
  constructor(props: DiscretePathEffectNodeProps) {
    super(NodeType.DashPathEffect, props);
  }

  get(Skia: Skia) {
    const { segLength, dev, seedAssist } = this.props;
    return Skia.PathEffect.MakeDiscrete(segLength, dev, seedAssist);
  }
}

export interface Path2DEffectNodeProps {
  matrix: SkMatrix;
  path: SkPath;
}

export class Path2DPathEffectNode extends DeclarationNode<
  Path2DEffectNodeProps,
  SkPathEffect,
  null
> {
  constructor(props: Path2DEffectNodeProps) {
    super(NodeType.Path2DPathEffect, props);
  }

  get(Skia: Skia) {
    const { matrix, path } = this.props;
    return Skia.PathEffect.MakePath2D(matrix, path);
  }
}

export interface DashPathEffectNodeProps {
  intervals: number[];
  phase?: number;
}

export class DashPathEffectNode extends DeclarationNode<
  DashPathEffectNodeProps,
  SkPathEffect
> {
  constructor(props: DashPathEffectNodeProps) {
    super(NodeType.DashPathEffect, props);
  }

  get(Skia: Skia) {
    const { intervals, phase } = this.props;
    return Skia.PathEffect.MakeDash(intervals, phase);
  }
}

export interface CornerPathEffectNodeProps {
  radius: number;
}

export class CornerPathEffectNode extends DeclarationNode<
  CornerPathEffectNodeProps,
  SkPathEffect,
  null
> {
  constructor(props: CornerPathEffectNodeProps) {
    super(NodeType.CornerPathEffect, props);
  }

  get(Skia: Skia) {
    const { radius } = this.props;
    return Skia.PathEffect.MakeCorner(radius);
  }
}

export interface ComposePathEffectNodeProps {
  outer: SkPathEffect;
  inner: SkPathEffect;
}

export class ComposePathEffectNode extends DeclarationNode<
  ComposePathEffectNodeProps,
  SkPathEffect
> {
  constructor(props: ComposePathEffectNodeProps) {
    super(NodeType.ComposePathEffect, props);
  }

  get(Skia: Skia) {
    const { outer, inner } = this.props;
    return Skia.PathEffect.MakeCompose(outer, inner);
  }
}

export interface SumPathEffectNodeProps {
  outer: SkPathEffect;
  inner: SkPathEffect;
}

export class SumPathEffectNode extends DeclarationNode<
  SumPathEffectNodeProps,
  SkPathEffect
> {
  constructor(props: SumPathEffectNodeProps) {
    super(NodeType.SumPathEffect, props);
  }

  get(Skia: Skia) {
    const { outer, inner } = this.props;
    return Skia.PathEffect.MakeSum(outer, inner);
  }
}

export interface Line2DPathEffectNodeProps {
  width: number;
  matrix: SkMatrix;
}

export class Line2DPathEffectNode extends DeclarationNode<
  Line2DPathEffectNodeProps,
  SkPathEffect,
  null
> {
  constructor(props: Line2DPathEffectNodeProps) {
    super(NodeType.Line2DPathEffect, props);
  }

  get(Skia: Skia) {
    const { width, matrix } = this.props;
    return Skia.PathEffect.MakeLine2D(width, matrix);
  }
}

export interface Path1DPathEffectNodeProps {
  path: SkPath;
  advance: number;
  phase: number;
  style: Path1DEffectStyle;
}

export class Path1DPathEffectNode extends DeclarationNode<
  Path1DPathEffectNodeProps,
  SkPathEffect,
  null
> {
  constructor(props: Path1DPathEffectNodeProps) {
    super(NodeType.Line2DPathEffect, props);
  }

  get(Skia: Skia) {
    const { path, advance, phase, style } = this.props;
    return Skia.PathEffect.MakePath1D(path, advance, phase, style);
  }
}
