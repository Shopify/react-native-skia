import { BlendMode } from "../../../skia/types";
import type { SkColorFilter } from "../../../skia/types";
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

  protected compose(cf1: SkColorFilter, ctx: DeclarationContext) {
    const cf2 = ctx.popColorFilter();
    const cf =
      cf2 === undefined ? cf1 : this.Skia.ColorFilter.MakeCompose(cf1!, cf2);
    ctx.pushColorFilter(cf);
  }
}

export class MatrixColorFilterNode extends ColorFilterDeclaration<MatrixColorFilterProps> {
  constructor(ctx: NodeContext, props: MatrixColorFilterProps) {
    super(ctx, NodeType.MatrixColorFilter, props);
  }

  decorate(ctx: DeclarationContext) {
    this.decorateChildren(ctx);
    const { matrix } = this.props;
    const cf = this.Skia.ColorFilter.MakeMatrix(matrix);
    this.compose(cf, ctx);
  }
}

export class BlendColorFilterNode extends ColorFilterDeclaration<BlendColorFilterProps> {
  constructor(ctx: NodeContext, props: BlendColorFilterProps) {
    super(ctx, NodeType.BlendColorFilter, props);
  }

  decorate(ctx: DeclarationContext) {
    this.decorateChildren(ctx);
    const { mode } = this.props;
    const color = this.Skia.Color(this.props.color);
    const cf = this.Skia.ColorFilter.MakeBlend(color, BlendMode[enumKey(mode)]);
    this.compose(cf, ctx);
  }
}

export class LinearToSRGBGammaColorFilterNode extends ColorFilterDeclaration<null> {
  constructor(ctx: NodeContext) {
    super(ctx, NodeType.LinearToSRGBGammaColorFilter, null);
  }

  decorate(ctx: DeclarationContext) {
    this.decorateChildren(ctx);
    const cf = this.Skia.ColorFilter.MakeLinearToSRGBGamma();
    this.compose(cf, ctx);
  }
}

export class SRGBToLinearGammaColorFilterNode extends ColorFilterDeclaration<null> {
  constructor(ctx: NodeContext) {
    super(ctx, NodeType.SRGBToLinearGammaColorFilter, null);
  }

  decorate(ctx: DeclarationContext) {
    const cf = this.Skia.ColorFilter.MakeSRGBToLinearGamma();
    this.compose(cf, ctx);
  }
}

export class LumaColorFilterNode extends ColorFilterDeclaration<null> {
  constructor(ctx: NodeContext) {
    super(ctx, NodeType.LumaColorFilter, null);
  }

  decorate(ctx: DeclarationContext) {
    const cf = this.Skia.ColorFilter.MakeLumaColorFilter();
    this.compose(cf, ctx);
  }
}

export class LerpColorFilterNode extends ColorFilterDeclaration<LerpColorFilterProps> {
  constructor(ctx: NodeContext, props: LerpColorFilterProps) {
    super(ctx, NodeType.LerpColorFilter, props);
  }

  decorate(ctx: DeclarationContext) {
    const { t } = this.props;
    const [first, second] = ctx.popColorFilters(2);
    if (!first || !second) {
      throw new Error(
        "LerpColorFilterNode: missing two color filters as children"
      );
    }
    return this.Skia.ColorFilter.MakeLerp(t, first, second);
  }
}
