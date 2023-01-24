import type { SkColorFilter } from "../../../skia/types";
import { BlendMode } from "../../../skia/types";
import type { NodeContext } from "../Node";
import { JsiDeclarationNode } from "../Node";
import type {
  BlendColorFilterProps,
  MatrixColorFilterProps,
} from "../../types";
import { DeclarationType, NodeType } from "../../types";
import { enumKey } from "../datatypes/Enum";
import type { LerpColorFilterProps } from "../../types/ColorFilters";
import type { DeclarationContext } from "../../types/DeclarationContext";

export abstract class ColorFilterDeclaration<P> extends JsiDeclarationNode<P> {
  constructor(ctx: NodeContext, type: NodeType, props: P) {
    super(ctx, DeclarationType.ColorFilter, type, props);
  }

  compose(ctx: DeclarationContext, cf1: SkColorFilter) {
    const childCtx = this.childDeclarationContext();
    const cf2 = childCtx.popColorFiltersAsOne();
    const cf = cf2 ? this.Skia.ColorFilter.MakeCompose(cf1, cf2) : cf1;
    ctx.colorFilters.push(cf);
  }
}

export class MatrixColorFilterNode extends ColorFilterDeclaration<MatrixColorFilterProps> {
  constructor(ctx: NodeContext, props: MatrixColorFilterProps) {
    super(ctx, NodeType.MatrixColorFilter, props);
  }

  decorate(ctx: DeclarationContext) {
    const { matrix } = this.props;
    const cf = this.Skia.ColorFilter.MakeMatrix(matrix);
    this.compose(ctx, cf);
  }
}

export class BlendColorFilterNode extends ColorFilterDeclaration<BlendColorFilterProps> {
  constructor(ctx: NodeContext, props: BlendColorFilterProps) {
    super(ctx, NodeType.BlendColorFilter, props);
  }

  decorate(ctx: DeclarationContext) {
    const { mode } = this.props;
    const color = this.Skia.Color(this.props.color);
    const cf = this.Skia.ColorFilter.MakeBlend(color, BlendMode[enumKey(mode)]);
    this.compose(ctx, cf);
  }
}

export class LinearToSRGBGammaColorFilterNode extends ColorFilterDeclaration<null> {
  constructor(ctx: NodeContext) {
    super(ctx, NodeType.LinearToSRGBGammaColorFilter, null);
  }

  decorate(ctx: DeclarationContext) {
    const cf = this.Skia.ColorFilter.MakeLinearToSRGBGamma();
    this.compose(ctx, cf);
  }
}

export class SRGBToLinearGammaColorFilterNode extends ColorFilterDeclaration<null> {
  constructor(ctx: NodeContext) {
    super(ctx, NodeType.SRGBToLinearGammaColorFilter, null);
  }

  decorate(ctx: DeclarationContext) {
    const cf = this.Skia.ColorFilter.MakeSRGBToLinearGamma();
    this.compose(ctx, cf);
  }
}

export class LumaColorFilterNode extends ColorFilterDeclaration<null> {
  constructor(ctx: NodeContext) {
    super(ctx, NodeType.LumaColorFilter, null);
  }

  decorate(ctx: DeclarationContext) {
    const cf = this.Skia.ColorFilter.MakeLumaColorFilter();
    this.compose(ctx, cf);
  }
}

export class LerpColorFilterNode extends ColorFilterDeclaration<LerpColorFilterProps> {
  constructor(ctx: NodeContext, props: LerpColorFilterProps) {
    super(ctx, NodeType.LerpColorFilter, props);
  }

  decorate(ctx: DeclarationContext) {
    const childCtx = this.childDeclarationContext();
    const { t } = this.props;
    const second = childCtx.colorFilters.pop();
    const first = childCtx.colorFilters.pop();
    if (!first || !second) {
      throw new Error(
        "LerpColorFilterNode: missing two color filters as children"
      );
    }
    ctx.colorFilters.push(this.Skia.ColorFilter.MakeLerp(t, first, second));
  }
}
