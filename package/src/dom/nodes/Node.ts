import type {
  SkColorFilter,
  Skia,
  SkImageFilter,
  SkMaskFilter,
  SkShader,
  SkPathEffect,
  SkPaint,
} from "../../skia/types";
import type {
  Node,
  DeclarationNode,
  LeafDeclarationNode,
  NodeType,
} from "../types";
import { DeclarationType } from "../types";

export abstract class JsiNode<P> implements Node<P> {
  protected _children: Node<unknown>[] = [];

  constructor(
    protected Skia: Skia,
    public type: NodeType,
    protected props: P
  ) {}

  setProps(props: P) {
    this.props = props;
  }

  setProp<K extends keyof P>(name: K, v: P[K]) {
    this.props[name] = v;
  }

  getProps() {
    return this.props;
  }

  children() {
    return this._children;
  }

  descendant() {
    const result: Node<unknown>[] = [];
    for (const child of this._children) {
      result.push(child);
      result.push(...child.descendant());
    }
    return result;
  }

  addChild(child: Node<unknown>) {
    this._children.push(child);
  }

  removeChild(child: Node<unknown>) {
    const index = this._children.indexOf(child);
    if (index !== -1) {
      const [node] = this._children.splice(index, 1);
      return [node, ...node.descendant()];
    }
    return [];
  }

  insertChildBefore(child: Node<unknown>, before: Node<unknown>) {
    const index = this._children.indexOf(child);
    if (index !== -1) {
      this._children.splice(index, 1);
    }
    const beforeIndex = this._children.indexOf(before);
    this._children.splice(beforeIndex, 0, child);
  }
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
  private invalidate: Invalidate = () => {};

  constructor(
    Skia: Skia,
    public declarationType: DeclarationType,
    type: NodeType,
    props: P
  ) {
    super(Skia, type, props);
  }

  abstract get(): T | Nullable;

  addChild(child: Node<unknown>): void {
    if (!(child instanceof JsiDeclarationNode)) {
      throw new Error(`Cannot add child of type ${child.type} to ${this.type}`);
    }
    super.addChild(child);
  }

  insertChildBefore(child: Node<unknown>, before: Node<unknown>): void {
    if (!(child instanceof JsiDeclarationNode)) {
      throw new Error(`Cannot add child of type ${child.type} to ${this.type}`);
    }
    super.insertChildBefore(child, before);
  }

  setInvalidate(invalidate: Invalidate) {
    this.invalidate = invalidate;
  }

  setProps(props: P) {
    super.setProps(props);
    this.invalidate();
  }

  setProp<K extends keyof P>(name: K, v: P[K]) {
    super.setProp(name, v);
    this.invalidate();
  }

  isPaint(): this is DeclarationNode<unknown, SkPaint> {
    return this.declarationType === DeclarationType.Paint;
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

export abstract class JsiLeafDeclarationNode<
    P,
    T,
    Nullable extends null | never = never
  >
  extends JsiDeclarationNode<P, T, Nullable>
  implements LeafDeclarationNode<P, T, Nullable>
{
  addChild(_child: Node<unknown>): void {
    throw new Error(`Cannot add child to ${this.type}`);
  }

  removeChild(_child: Node<unknown>): Node<unknown>[] {
    throw new Error(`Cannot remove child from ${this.type}`);
  }

  insertChildBefore(_child: Node<unknown>, _before: Node<unknown>): void {
    throw new Error(`Cannot insert child into ${this.type}`);
  }
}
