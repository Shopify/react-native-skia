import type {
  SkColorFilter,
  SkImageFilter,
  SkMaskFilter,
  SkPathEffect,
  SkShader,
} from "../../../skia/types";

import type { DrawingContext } from "./DrawingContext";
import type { DeclarationType, NodeType } from "./NodeType";

export interface Node<P> {
  type: NodeType;
  setProps(props: P): void;
}

export interface RenderNode<P> extends Node<P> {
  render(ctx: DrawingContext): void;
}

export type Invalidate = () => void;

export interface DeclarationNode<P, T, Nullable extends null | never = never>
  extends Node<P> {
  declarationType: DeclarationType;
  get(): T | Nullable;

  setInvalidate(invalidate: Invalidate): void;

  isImageFilter(): this is DeclarationNode<unknown, SkImageFilter>;
  isColorFilter(): this is DeclarationNode<unknown, SkColorFilter>;
  isShader(): this is DeclarationNode<unknown, SkShader>;
  isMaskFilter(): this is DeclarationNode<unknown, SkMaskFilter>;
  isPathEffect(): this is DeclarationNode<unknown, SkPathEffect>;
}

export interface NestedDeclarationNode<
  P,
  T,
  Nullable extends null | never = never
> extends DeclarationNode<P, T, Nullable> {
  addChild(child: DeclarationNode<unknown, T>): void;
}

export interface GroupNode extends RenderNode<unknown> {
  addChild(child: RenderNode<unknown>): void;

  addEffect(
    effect:
      | DeclarationNode<unknown, SkShader>
      | DeclarationNode<unknown, SkImageFilter>
      | DeclarationNode<unknown, SkColorFilter>
      | DeclarationNode<unknown, SkMaskFilter>
      | DeclarationNode<unknown, SkPathEffect>
  ): void;
}
