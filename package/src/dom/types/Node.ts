import type {
  SkColorFilter,
  SkImageFilter,
  SkMaskFilter,
  SkPaint,
  SkPathEffect,
  SkShader,
} from "../../skia/types";

import type { GroupProps } from "./Common";
import type { DrawingContext } from "./DrawingContext";
import type { DeclarationType, NodeType } from "./NodeType";

export interface Node<P> {
  type: NodeType;

  setProps(props: P): void;
  setProp<K extends keyof P>(name: K, v: P[K]): void;
  getProps(): P;

  children(): Node<unknown>[];
  descendant(): Node<unknown>[];
  addChild(child: Node<unknown>): void;
  removeChild(child: Node<unknown>): Node<unknown>[];
  insertChildBefore(child: Node<unknown>, before: Node<unknown>): void;
}

export type Invalidate = () => void;

export interface DeclarationNode<P, T, Nullable extends null | never = never>
  extends Node<P> {
  declarationType: DeclarationType;
  get(): T | Nullable;

  setInvalidate(invalidate: Invalidate): void;

  isPaint(): this is DeclarationNode<unknown, SkPaint>;
  isImageFilter(): this is DeclarationNode<unknown, SkImageFilter>;
  isColorFilter(): this is DeclarationNode<unknown, SkColorFilter>;
  isShader(): this is DeclarationNode<unknown, SkShader>;
  isMaskFilter(): this is DeclarationNode<unknown, SkMaskFilter>;
  isPathEffect(): this is DeclarationNode<unknown, SkPathEffect>;
}

export type LeafDeclarationNode<
  P,
  T,
  Nullable extends null | never = never
> = DeclarationNode<P, T, Nullable>;

export interface RenderNode<P extends GroupProps> extends Node<P> {
  render(ctx: DrawingContext): void;
}
