import { Path1DEffectStyle } from "../../../skia/types";
import type { SkPathEffect } from "../../../skia/types";
import type { NodeContext } from "../Node";
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
import type { DeclarationContext } from "../../types/DeclarationContext";
import { composeDeclarations } from "../../types/DeclarationContext";

abstract class PathEffectDeclaration<P> extends JsiDeclarationNode<P> {
  constructor(ctx: NodeContext, type: NodeType, props: P) {
    super(ctx, DeclarationType.PathEffect, type, props);
  }

  protected composeAndPush(ctx: DeclarationContext, pe1: SkPathEffect) {
    ctx.save();
    this.decorateChildren(ctx);
    const pe2 = ctx.pathEffects.popAllAsOne();
    ctx.restore();
    const pe = pe2 ? this.Skia.PathEffect.MakeCompose(pe1, pe2) : pe1;
    ctx.pathEffects.push(pe);
  }
}

export class DiscretePathEffectNode extends PathEffectDeclaration<DiscretePathEffectProps> {
  constructor(ctx: NodeContext, props: DiscretePathEffectProps) {
    super(ctx, NodeType.DiscretePathEffect, props);
  }

  decorate(ctx: DeclarationContext) {
    const { length, deviation, seed } = this.props;
    const pe = this.Skia.PathEffect.MakeDiscrete(length, deviation, seed);
    this.composeAndPush(ctx, pe);
  }
}

export class Path2DPathEffectNode extends PathEffectDeclaration<Path2DPathEffectProps> {
  constructor(ctx: NodeContext, props: Path2DPathEffectProps) {
    super(ctx, NodeType.Path2DPathEffect, props);
  }

  decorate(ctx: DeclarationContext) {
    const { matrix } = this.props;
    const path = processPath(this.Skia, this.props.path);
    const pe = this.Skia.PathEffect.MakePath2D(matrix, path);
    if (pe === null) {
      throw new Error("Path2DPathEffectNode: invalid path");
    }
    this.composeAndPush(ctx, pe);
  }
}

export class DashPathEffectNode extends PathEffectDeclaration<DashPathEffectProps> {
  constructor(ctx: NodeContext, props: DashPathEffectProps) {
    super(ctx, NodeType.DashPathEffect, props);
  }

  decorate(ctx: DeclarationContext) {
    const { intervals, phase } = this.props;
    const pe = this.Skia.PathEffect.MakeDash(intervals, phase);
    this.composeAndPush(ctx, pe);
  }
}

export class CornerPathEffectNode extends PathEffectDeclaration<CornerPathEffectProps> {
  constructor(ctx: NodeContext, props: CornerPathEffectProps) {
    super(ctx, NodeType.CornerPathEffect, props);
  }

  decorate(ctx: DeclarationContext) {
    const { r } = this.props;
    const pe = this.Skia.PathEffect.MakeCorner(r);
    if (pe === null) {
      throw new Error("CornerPathEffectNode: couldn't create path effect");
    }
    this.composeAndPush(ctx, pe);
  }
}

export class SumPathEffectNode extends PathEffectDeclaration<null> {
  constructor(ctx: NodeContext) {
    super(ctx, NodeType.SumPathEffect, null);
  }

  decorate(ctx: DeclarationContext) {
    this.decorateChildren(ctx);
    const pes = ctx.pathEffects.popAll();
    const pe = composeDeclarations(
      pes,
      this.Skia.PathEffect.MakeSum.bind(this.Skia.PathEffect)
    );
    ctx.pathEffects.push(pe);
  }
}

export class Line2DPathEffectNode extends PathEffectDeclaration<Line2DPathEffectProps> {
  constructor(ctx: NodeContext, props: Line2DPathEffectProps) {
    super(ctx, NodeType.Line2DPathEffect, props);
  }

  decorate(ctx: DeclarationContext) {
    const { width, matrix } = this.props;
    const pe = this.Skia.PathEffect.MakeLine2D(width, matrix);
    if (pe === null) {
      throw new Error("Line2DPathEffectNode: could not create path effect");
    }
    this.composeAndPush(ctx, pe);
  }
}

export class Path1DPathEffectNode extends PathEffectDeclaration<Path1DPathEffectProps> {
  constructor(ctx: NodeContext, props: Path1DPathEffectProps) {
    super(ctx, NodeType.Path1DPathEffect, props);
  }

  decorate(ctx: DeclarationContext) {
    const { advance, phase, style } = this.props;
    const path = processPath(this.Skia, this.props.path);
    const pe = this.Skia.PathEffect.MakePath1D(
      path,
      advance,
      phase,
      Path1DEffectStyle[enumKey(style)]
    );
    if (pe === null) {
      throw new Error("Path1DPathEffectNode: could not create path effect");
    }
    this.composeAndPush(ctx, pe);
  }
}
