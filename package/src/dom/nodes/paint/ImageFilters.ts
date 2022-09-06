import type { SkImageFilter, Skia, SkColor } from "../../../skia/types";
import {
  BlendMode,
  ColorChannel,
  processUniforms,
  TileMode,
} from "../../../skia/types";
import type {
  BlendImageFilterProps,
  BlurImageFilterProps,
  DisplacementMapImageFilterProps,
  DropShadowImageFilterProps,
  MorphologyImageFilterProps,
  OffsetImageFilterProps,
  RuntimeShaderImageFilterProps,
} from "../../types";
import { DeclarationType, NodeType } from "../../types";
import { processRadius, enumKey, processColor } from "../datatypes";
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

export abstract class ImageFilterDeclaration<
  P,
  Nullable extends null | never = never
> extends JsiDeclarationNode<P, SkImageFilter, Nullable> {
  constructor(Skia: Skia, type: NodeType, props: P) {
    super(Skia, DeclarationType.ImageFilter, type, props);
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
      if (child.isImageFilter()) {
        return child.get();
      } else if (child.isShader()) {
        return this.Skia.ImageFilter.MakeShader(child.get(), null);
      } else if (child.declarationType === DeclarationType.ColorFilter) {
        return this.Skia.ImageFilter.MakeColorFilter(child.get(), null);
      } else {
        throw new Error(`Found invalid child ${child.type} in ${this.type}`);
      }
    } else {
      throw new Error(`Found invalid child ${child.type} in ${this.type}`);
    }
  }
}

export class OffsetImageFilterNode extends ImageFilterDeclaration<OffsetImageFilterProps> {
  constructor(Skia: Skia, props: OffsetImageFilterProps) {
    super(Skia, NodeType.OffsetImageFilter, props);
  }

  get() {
    const { x, y } = this.props;
    return this.Skia.ImageFilter.MakeOffset(
      x,
      y,
      this.getOptionalChildInstance(0)
    );
  }
}

export class DisplacementMapImageFilterNode extends ImageFilterDeclaration<DisplacementMapImageFilterProps> {
  constructor(Skia: Skia, props: DisplacementMapImageFilterProps) {
    super(Skia, NodeType.DisplacementMapImageFilter, props);
  }

  get() {
    const { channelX, channelY, scale } = this.props;
    return this.Skia.ImageFilter.MakeDisplacementMap(
      ColorChannel[enumKey(channelX)],
      ColorChannel[enumKey(channelY)],
      scale,
      this.getMandatoryChildInstance(0),
      this.getOptionalChildInstance(1)
    );
  }
}

export class BlurImageFilterNode extends ImageFilterDeclaration<BlurImageFilterProps> {
  constructor(Skia: Skia, props: BlurImageFilterProps) {
    super(Skia, NodeType.BlurImageFilter, props);
  }

  get() {
    const { mode, blur } = this.props;
    const sigma = processRadius(this.Skia, blur);
    return this.Skia.ImageFilter.MakeBlur(
      sigma.x,
      sigma.y,
      TileMode[enumKey(mode)],
      this.getOptionalChildInstance(0)
    );
  }
}

export class DropShadowImageFilterNode extends ImageFilterDeclaration<DropShadowImageFilterProps> {
  constructor(Skia: Skia, props: DropShadowImageFilterProps) {
    super(Skia, NodeType.BlurImageFilter, props);
  }

  get() {
    const { dx, dy, blur, shadowOnly, color: cl, inner } = this.props;
    const color = processColor(this.Skia, cl, 1);
    const input = this.getOptionalChildInstance(0);
    let factory;
    if (inner) {
      factory = MakeInnerShadow.bind(null, this.Skia, shadowOnly);
    } else {
      factory = shadowOnly
        ? this.Skia.ImageFilter.MakeDropShadowOnly.bind(this.Skia.ImageFilter)
        : this.Skia.ImageFilter.MakeDropShadow.bind(this.Skia.ImageFilter);
    }
    return factory(dx, dy, blur, blur, color, input);
  }
}

export enum MorphologyOperator {
  Erode,
  Dilate,
}

export class MorphologyImageFilterNode extends ImageFilterDeclaration<MorphologyImageFilterProps> {
  constructor(Skia: Skia, props: MorphologyImageFilterProps) {
    super(Skia, NodeType.MorphologyImageFilter, props);
  }

  get() {
    const { operator } = this.props;
    const r = processRadius(this.Skia, this.props.radius);
    const input = this.getOptionalChildInstance(0);
    if (MorphologyOperator[enumKey(operator)] === MorphologyOperator.Erode) {
      return this.Skia.ImageFilter.MakeErode(r.x, r.y, input);
    }
    return this.Skia.ImageFilter.MakeDilate(r.x, r.y, input);
  }
}

export class BlendImageFilterNode extends ImageFilterDeclaration<BlendImageFilterProps> {
  constructor(Skia: Skia, props: BlendImageFilterProps) {
    super(Skia, NodeType.BlendImageFilter, props);
  }

  get() {
    const { mode } = this.props;
    const a = this.getMandatoryChildInstance(0);
    const b = this.getMandatoryChildInstance(1);
    return this.Skia.ImageFilter.MakeBlend(mode, a, b);
  }
}

export class RuntimeShaderImageFilterNode extends ImageFilterDeclaration<RuntimeShaderImageFilterProps> {
  constructor(Skia: Skia, props: RuntimeShaderImageFilterProps) {
    super(Skia, NodeType.RuntimeShaderImageFilter, props);
  }

  get() {
    const { source, uniforms } = this.props;
    const rtb = this.Skia.RuntimeShaderBuilder(source);
    if (uniforms) {
      processUniforms(source, uniforms, rtb);
    }
    const input = this.getOptionalChildInstance(0);
    return this.Skia.ImageFilter.MakeRuntimeShader(rtb, null, input);
  }
}
