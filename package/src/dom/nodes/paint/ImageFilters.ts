import type { SkImageFilter, SkColor, Skia } from "../../../skia/types";
import {
  BlendMode,
  ColorChannel,
  processUniforms,
  TileMode,
} from "../../../skia/types";
import type {
  BlendImageFilterProps,
  BlurImageFilterProps,
  DeclarationContext,
  DisplacementMapImageFilterProps,
  DropShadowImageFilterProps,
  MorphologyImageFilterProps,
  OffsetImageFilterProps,
  RuntimeShaderImageFilterProps,
} from "../../types";
import { DeclarationType, NodeType } from "../../types";
import { processRadius, enumKey } from "../datatypes";
import type { NodeContext } from "../Node";
import { JsiDeclarationNode } from "../Node";

const Black = Float32Array.of(0, 0, 0, 1);

const MakeInnerShadow = (
  Skia: Skia,
  shadowOnly: boolean | undefined,
  dx: number,
  dy: number,
  sigmaX: number,
  sigmaY: number,
  color: SkColor,
  input: SkImageFilter | null
) => {
  const sourceGraphic = Skia.ImageFilter.MakeColorFilter(
    Skia.ColorFilter.MakeBlend(Black, BlendMode.Dst),
    null
  );
  const sourceAlpha = Skia.ImageFilter.MakeColorFilter(
    Skia.ColorFilter.MakeBlend(Black, BlendMode.SrcIn),
    null
  );
  const f1 = Skia.ImageFilter.MakeColorFilter(
    Skia.ColorFilter.MakeBlend(color, BlendMode.SrcOut),
    null
  );
  const f2 = Skia.ImageFilter.MakeOffset(dx, dy, f1);
  const f3 = Skia.ImageFilter.MakeBlur(sigmaX, sigmaY, TileMode.Decal, f2);
  const f4 = Skia.ImageFilter.MakeBlend(BlendMode.SrcIn, sourceAlpha, f3);
  if (shadowOnly) {
    return f4;
  }
  return Skia.ImageFilter.MakeCompose(
    input,
    Skia.ImageFilter.MakeBlend(BlendMode.SrcOver, sourceGraphic, f4)
  );
};

export abstract class ImageFilterDeclaration<P> extends JsiDeclarationNode<P> {
  constructor(ctx: NodeContext, type: NodeType, props: P) {
    super(ctx, DeclarationType.ImageFilter, type, props);
  }

  protected input(ctx: DeclarationContext) {
    return ctx.imageFilters.pop() ?? null;
  }

  protected composeAndPush(ctx: DeclarationContext, imgf1: SkImageFilter) {
    ctx.save();
    this.decorateChildren(ctx);
    let imgf2 = ctx.imageFilters.popAllAsOne();
    const cf = ctx.colorFilters.popAllAsOne();
    ctx.restore();
    if (cf) {
      imgf2 = this.Skia.ImageFilter.MakeCompose(
        imgf2 ?? null,
        this.Skia.ImageFilter.MakeColorFilter(cf, null)
      );
    }
    const imgf = imgf2
      ? this.Skia.ImageFilter.MakeCompose(imgf1, imgf2)
      : imgf1;
    ctx.imageFilters.push(imgf);
  }
}

export class OffsetImageFilterNode extends ImageFilterDeclaration<OffsetImageFilterProps> {
  constructor(ctx: NodeContext, props: OffsetImageFilterProps) {
    super(ctx, NodeType.OffsetImageFilter, props);
  }

  decorate(ctx: DeclarationContext) {
    this.decorateChildren(ctx);
    const { x, y } = this.props;
    const imgf = this.Skia.ImageFilter.MakeOffset(x, y, null);
    this.composeAndPush(ctx, imgf);
  }
}

export class DisplacementMapImageFilterNode extends ImageFilterDeclaration<DisplacementMapImageFilterProps> {
  constructor(ctx: NodeContext, props: DisplacementMapImageFilterProps) {
    super(ctx, NodeType.DisplacementMapImageFilter, props);
  }

  decorate(ctx: DeclarationContext) {
    this.decorateChildren(ctx);
    const { channelX, channelY, scale } = this.props;
    const shader = ctx.shaders.pop();
    if (!shader) {
      throw new Error("DisplacementMap expects a shader as child");
    }
    const map = this.Skia.ImageFilter.MakeShader(shader, null);
    const imgf = this.Skia.ImageFilter.MakeDisplacementMap(
      ColorChannel[enumKey(channelX)],
      ColorChannel[enumKey(channelY)],
      scale,
      map,
      this.input(ctx)
    );
    ctx.imageFilters.push(imgf);
  }
}

export class BlurImageFilterNode extends ImageFilterDeclaration<BlurImageFilterProps> {
  constructor(ctx: NodeContext, props: BlurImageFilterProps) {
    super(ctx, NodeType.BlurImageFilter, props);
  }

  decorate(ctx: DeclarationContext) {
    const { mode, blur } = this.props;
    const sigma = processRadius(this.Skia, blur);
    const imgf = this.Skia.ImageFilter.MakeBlur(
      sigma.x,
      sigma.y,
      TileMode[enumKey(mode)],
      this.input(ctx)
    );
    this.composeAndPush(ctx, imgf);
  }
}

export class DropShadowImageFilterNode extends ImageFilterDeclaration<DropShadowImageFilterProps> {
  constructor(ctx: NodeContext, props: DropShadowImageFilterProps) {
    super(ctx, NodeType.DropShadowImageFilter, props);
  }

  decorate(ctx: DeclarationContext) {
    const { dx, dy, blur, shadowOnly, color: cl, inner } = this.props;
    const color = this.Skia.Color(cl);
    let factory;
    if (inner) {
      factory = MakeInnerShadow.bind(null, this.Skia, shadowOnly);
    } else {
      factory = shadowOnly
        ? this.Skia.ImageFilter.MakeDropShadowOnly.bind(this.Skia.ImageFilter)
        : this.Skia.ImageFilter.MakeDropShadow.bind(this.Skia.ImageFilter);
    }
    const imgf = factory(dx, dy, blur, blur, color, this.input(ctx));
    this.composeAndPush(ctx, imgf);
  }
}

export enum MorphologyOperator {
  Erode,
  Dilate,
}

export class MorphologyImageFilterNode extends ImageFilterDeclaration<MorphologyImageFilterProps> {
  constructor(ctx: NodeContext, props: MorphologyImageFilterProps) {
    super(ctx, NodeType.MorphologyImageFilter, props);
  }

  decorate(ctx: DeclarationContext) {
    const { operator } = this.props;
    const r = processRadius(this.Skia, this.props.radius);
    let imgf;
    if (MorphologyOperator[enumKey(operator)] === MorphologyOperator.Erode) {
      imgf = this.Skia.ImageFilter.MakeErode(r.x, r.y, this.input(ctx));
    } else {
      imgf = this.Skia.ImageFilter.MakeDilate(r.x, r.y, this.input(ctx));
    }
    this.composeAndPush(ctx, imgf);
  }
}

export class BlendImageFilterNode extends ImageFilterDeclaration<BlendImageFilterProps> {
  constructor(ctx: NodeContext, props: BlendImageFilterProps) {
    super(ctx, NodeType.BlendImageFilter, props);
  }

  decorate(ctx: DeclarationContext) {
    const { mode } = this.props;
    const a = ctx.imageFilters.pop();
    const b = ctx.imageFilters.pop();
    if (!a || !b) {
      throw new Error("BlendImageFilter requires two image filters");
    }
    const imgf = this.Skia.ImageFilter.MakeBlend(mode, a, b);
    this.composeAndPush(ctx, imgf);
  }
}

export class RuntimeShaderImageFilterNode extends ImageFilterDeclaration<RuntimeShaderImageFilterProps> {
  constructor(ctx: NodeContext, props: RuntimeShaderImageFilterProps) {
    super(ctx, NodeType.RuntimeShaderImageFilter, props);
  }

  decorate(ctx: DeclarationContext) {
    const { source, uniforms } = this.props;
    const rtb = this.Skia.RuntimeShaderBuilder(source);
    if (uniforms) {
      processUniforms(source, uniforms, rtb);
    }
    const imgf = this.Skia.ImageFilter.MakeRuntimeShader(
      rtb,
      null,
      this.input(ctx)
    );
    this.composeAndPush(ctx, imgf);
  }
}
