import type {
  SkColorFilter,
  Skia,
  SkImageFilter,
  SkMaskFilter,
  SkShader,
  SkPathEffect,
} from "../../skia/types";
import type { Node, DrawingContext, DeclarationNode, NodeType } from "../types";
import { DeclarationType } from "../types";

export abstract class JsiNode<P> implements Node<P> {
  constructor(
    protected Skia: Skia,
    public type: NodeType,
    protected props: P
  ) {}

  setProps(props: P) {
    this.props = props;
  }
}

export abstract class JsiRenderNode<P> extends JsiNode<P> {
  constructor(Skia: Skia, type: NodeType, props: P) {
    super(Skia, type, props);
  }

  abstract render(ctx: DrawingContext): void;
}

export type Invalidate = () => void;

export abstract class JsiDeclarationNode<
  P,
  T,
  Nullable extends null | never = never
> extends JsiNode<P> {
  private invalidate: Invalidate | null = null;

  constructor(
    Skia: Skia,
    public declarationType: DeclarationType,
    type: NodeType,
    props: P
  ) {
    super(Skia, type, props);
  }

  abstract get(): T | Nullable;

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

  isMaskFilter(): this is DeclarationNode<unknown, SkMaskFilter> {
    return this.declarationType === DeclarationType.MaskFilter;
  }

  isPathEffect(): this is DeclarationNode<unknown, SkPathEffect> {
    return this.declarationType === DeclarationType.PathEffect;
  }
}

export abstract class JsiNestedDeclarationNode<
  P,
  T,
  Nullable extends null | never = never
> extends JsiDeclarationNode<P, T, Nullable> {
  protected children: DeclarationNode<unknown, T>[] = [];

  constructor(
    Skia: Skia,
    declarationType: DeclarationType,
    type: NodeType,
    props: P
  ) {
    super(Skia, declarationType, type, props);
  }

  addChild(child: DeclarationNode<unknown, T>) {
    this.children.push(child);
  }

  protected getRecursively(compose: (a: T, b: T) => T) {
    return this.children
      .map((child) => child.get())
      .reduce<T | null>((acc, p) => {
        if (acc === null) {
          return p;
        }
        return compose(acc, p);
      }, null) as T;
  }
}
