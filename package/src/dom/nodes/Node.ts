import type {
  SkColorFilter,
  Skia,
  SkImageFilter,
  SkMaskFilter,
  SkShader,
  SkPathEffect,
} from "../../skia/types";
import type {
  Node,
  DrawingContext,
  DeclarationNode,
  NodeType,
  RenderNode,
  NestedDeclarationNode,
  PaintNode,
  GroupNode,
  DrawingNode,
  DrawingNodeProps,
} from "../types";
import { NodeKind, DeclarationType } from "../types";

export abstract class JsiNode<P> implements Node<P> {
  constructor(
    protected Skia: Skia,
    public kind: NodeKind,
    public type: NodeType,
    protected props: P
  ) {}

  setProps(props: P) {
    this.props = props;
  }

  isPaint(): this is PaintNode {
    return this.kind === NodeKind.Paint;
  }

  isGroup(): this is GroupNode {
    return this.kind === NodeKind.Group;
  }

  isDeclaration(): this is DeclarationNode<P, unknown> {
    return (
      this.kind === NodeKind.Declaration ||
      this.kind === NodeKind.NestedDeclaration
    );
  }

  isNestedDeclaration(): this is NestedDeclarationNode<P, unknown> {
    return this.kind === NodeKind.NestedDeclaration;
  }

  isDrawing(): this is DrawingNode<DrawingNodeProps> {
    return this.kind === NodeKind.Drawing;
  }
}

export abstract class JsiRenderNode<P>
  extends JsiNode<P>
  implements RenderNode<P>
{
  constructor(Skia: Skia, kind: NodeKind, type: NodeType, props: P) {
    super(Skia, kind, type, props);
  }

  abstract render(ctx: DrawingContext): void;
}

export type Invalidate = () => void;

export abstract class JsiDeclarationNode<
    P,
    T,
    Nullable extends null | never = never
  >
  extends JsiNode<P>
  implements DeclarationNode<P, T, Nullable>
{
  private invalidate: Invalidate | null = null;
  constructor(
    Skia: Skia,
    public declarationType: DeclarationType,
    type: NodeType,
    props: P,
    kind: NodeKind = NodeKind.Declaration
  ) {
    super(Skia, kind, type, props);
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
    C = T,
    Nullable extends null | never = never
  >
  extends JsiDeclarationNode<P, T, Nullable>
  implements NestedDeclarationNode<P, T, C, Nullable>
{
  protected children: DeclarationNode<unknown, C>[] = [];

  constructor(
    Skia: Skia,
    declarationType: DeclarationType,
    type: NodeType,
    props: P
  ) {
    super(Skia, declarationType, type, props, NodeKind.NestedDeclaration);
  }

  addChild(child: DeclarationNode<unknown, C>) {
    this.children.push(child);
  }

  removeChild(child: DeclarationNode<unknown, C>) {
    this.children.splice(this.children.indexOf(child), 1);
  }

  protected getRecursively(compose: (a: C, b: C) => C) {
    return this.children
      .map((child) => child.get())
      .reduce<C | null>((acc, p) => {
        if (acc === null) {
          return p;
        }
        return compose(acc, p);
      }, null) as C;
  }
}
