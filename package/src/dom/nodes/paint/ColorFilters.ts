import { BlendMode } from "../../../skia/types";
import type { SkColorFilter } from "../../../skia/types";
import type { NodeContext } from "../Node";
import { JsiDeclarationNode } from "../Node";
import type {
  BlendColorFilterProps,
  MatrixColorFilterProps,
} from "../../types";
import { DeclarationType, NodeType } from "../../types";
import { processColor } from "../datatypes";
import { enumKey } from "../datatypes/Enum";
import type { LerpColorFilterProps } from "../../types/ColorFilters";

export abstract class ColorFilterDeclaration<
  P,
  Nullable extends null | never = never
> extends JsiDeclarationNode<P, SkColorFilter, Nullable> {
  constructor(ctx: NodeContext, type: NodeType, props: P) {
    super(ctx, DeclarationType.ColorFilter, type, props);
  }

  compose(filter: SkColorFilter) {
    const child = this._children[0];
    if (child instanceof JsiDeclarationNode && child.isColorFilter()) {
      return this.Skia.ColorFilter.MakeCompose(filter, child.get());
    }
    return filter;
  }
}

export class MatrixColorFilterNode extends ColorFilterDeclaration<MatrixColorFilterProps> {
  constructor(ctx: NodeContext, props: MatrixColorFilterProps) {
    super(ctx, NodeType.MatrixColorFilter, props);
  }

  get() {
    const { matrix } = this.props;
    const cf = this.Skia.ColorFilter.MakeMatrix(matrix);
    return this.compose(cf);
  }
}

export class BlendColorFilterNode extends ColorFilterDeclaration<BlendColorFilterProps> {
  constructor(ctx: NodeContext, props: BlendColorFilterProps) {
    super(ctx, NodeType.BlendColorFilter, props);
  }

  get() {
    const { mode } = this.props;
    const color = processColor(this.Skia, this.props.color, 1);
    const cf = this.Skia.ColorFilter.MakeBlend(color, BlendMode[enumKey(mode)]);
    return this.compose(cf);
  }
}

export class LinearToSRGBGammaColorFilterNode extends ColorFilterDeclaration<null> {
  constructor(ctx: NodeContext) {
    super(ctx, NodeType.LinearToSRGBGammaColorFilter, null);
  }

  get() {
    const cf = this.Skia.ColorFilter.MakeLinearToSRGBGamma();
    return this.compose(cf);
  }
}

export class SRGBToLinearGammaColorFilterNode extends ColorFilterDeclaration<null> {
  constructor(ctx: NodeContext) {
    super(ctx, NodeType.SRGBToLinearGammaColorFilter, null);
  }

  get() {
    const cf = this.Skia.ColorFilter.MakeSRGBToLinearGamma();
    return this.compose(cf);
  }
}

export class LumaColorFilterNode extends ColorFilterDeclaration<null> {
  constructor(ctx: NodeContext) {
    super(ctx, NodeType.LumaColorFilter, null);
  }

  get() {
    const cf = this.Skia.ColorFilter.MakeLumaColorFilter();
    return this.compose(cf);
  }
}

export class LerpColorFilterNode extends ColorFilterDeclaration<LerpColorFilterProps> {
  constructor(ctx: NodeContext, props: LerpColorFilterProps) {
    super(ctx, NodeType.LerpColorFilter, props);
  }

  get() {
    const { t } = this.props;
    const [first, second] = this.children() as JsiDeclarationNode<
      unknown,
      SkColorFilter
    >[];
    return this.Skia.ColorFilter.MakeLerp(t, first.get(), second.get());
  }
}
