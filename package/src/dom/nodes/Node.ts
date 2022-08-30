import type {
  SkCanvas,
  SkColorFilter,
  Skia,
  SkImageFilter,
  SkPaint,
  SkShader,
} from "../../skia/types";

export enum NodeType {
  Group,

  Shader,
  ImageShader,

  BlurMaskFilter,

  DiscretePathEffect,
  DashPathEffect,
  Path1DPathEffect,
  Path2DPathEffect,
  CornerPathEffect,
  ComposePathEffect,
  SumPathEffect,
  Line2DPathEffect,

  MatrixColorFilter,
  BlendColorFilter,
  ComposeColorFilter,
  LinearToSRGBGammaColorFilter,
  SRGBToLinearGammaColorFilter,
  LumaColorFilterColorFilter,

  OffsetImageFilter,
  DisplacementMapImageFilter,
  BlurImageFilter,
  DropShadowImageFilter,
  MorphologyImageFilter,
  BlendImageFilter,
  RuntimeShaderImageFilter,

  Drawing,
  Paint,
  Circle,
  Fill,
  Image,
  Points,
  Path,
  Rect,
  RRect,
  Oval,
  Line,
  Patch,
  Vertices,
}

export enum DeclarationType {
  Shader,
  ImageFilter,
  ColorFilter,
  PathEffect,
  MaskFilter,
}

export interface DrawingContext {
  Skia: Skia;
  canvas: SkCanvas;
  paint: SkPaint;
  opacity: number;
}

export abstract class Node<P> {
  constructor(public type: NodeType, protected props: P) {}

  setProps(props: P) {
    this.props = props;
  }
}

export abstract class RenderNode<P> extends Node<P> {
  constructor(type: NodeType, props: P) {
    super(type, props);
  }

  abstract render(ctx: DrawingContext): void;
}

export type Invalidate = () => void;

export abstract class DeclarationNode<
  P,
  T,
  Nullable extends null | never = never
> extends Node<P> {
  private invalidate: Invalidate | null = null;

  constructor(
    public declarationType: DeclarationType,
    type: NodeType,
    props: P
  ) {
    super(type, props);
  }

  abstract get(Skia: Skia): T | Nullable;

  setInvalidate(invalidate: Invalidate) {
    this.invalidate = invalidate;
  }

  setProps(props: P) {
    if (!this.invalidate) {
      throw new Error(
        "Setting props on a declaration not attached to a drawing"
      );
    }
    this.props = props;
    this.invalidate();
  }

  isImageFilter(): this is DeclarationNode<unknown, SkImageFilter> {
    return this.declarationType === DeclarationType.ImageFilter;
  }

  isColorFilter(): this is DeclarationNode<unknown, SkColorFilter> {
    return this.declarationType === DeclarationType.ColorFilter;
  }

  isShader(): this is DeclarationNode<unknown, SkShader> {
    return this.declarationType === DeclarationType.Shader;
  }
}

export abstract class NestedDeclarationNode<
  P,
  T,
  Nullable extends null | never = never
> extends DeclarationNode<P, T, Nullable> {
  protected children: DeclarationNode<unknown, T>[] = [];

  constructor(declarationType: DeclarationType, type: NodeType, props: P) {
    super(declarationType, type, props);
  }

  addChild(child: DeclarationNode<unknown, T>) {
    this.children.push(child);
  }

  protected getRecursively(Skia: Skia, compose: (a: T, b: T) => T) {
    return this.children
      .map((child) => child.get(Skia))
      .reduce<T | null>((acc, p) => {
        if (acc === null) {
          return p;
        }
        return compose(acc, p);
      }, null) as T;
  }
}
