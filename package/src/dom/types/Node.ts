import type {
  SkColorFilter,
  SkImageFilter,
  SkMaskFilter,
  SkPaint,
  SkPathEffect,
  SkShader,
} from "../../skia/types";

import type { GroupProps, PaintProps } from "./Common";
import type { DrawingContext } from "./DrawingContext";
import type { DeclarationType, NodeKind, NodeType } from "./NodeType";

export interface Node<P> {
  type: NodeType;
  kind: NodeKind;
  setProps(props: P): void;
  setProp<K extends keyof P>(name: K, v: P[K]): void;

  isPaint(): this is PaintNode;
  isGroup(): this is GroupNode;
  isDeclaration(): this is Effect;
  isNestedDeclaration(): this is NestedDeclarationNode<P, unknown>;
  isDrawing(): this is DrawingNode<DrawingNodeProps>;
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
  C = T,
  Nullable extends null | never = never
> extends DeclarationNode<P, T, Nullable> {
  addChild(child: DeclarationNode<unknown, C>): void;
  insertChildBefore(
    child: DeclarationNode<unknown, C>,
    before: DeclarationNode<unknown, C>
  ): void;
  removeChild(child: DeclarationNode<unknown, C>): void;
}

export type Effect =
  | DeclarationNode<unknown, SkShader>
  | DeclarationNode<unknown, SkImageFilter>
  | DeclarationNode<unknown, SkColorFilter>
  | DeclarationNode<unknown, SkMaskFilter>
  | DeclarationNode<unknown, SkPathEffect>;

export interface GroupNode extends RenderNode<GroupProps> {
  addChild(child: RenderNode<unknown>): void;
  insertChildBefore(
    child: RenderNode<unknown>,
    before: RenderNode<unknown>
  ): void;
  removeChild(child: RenderNode<unknown>): void;

  addEffect(effect: Effect): void;
  removeEffect(effect: Effect): void;
}

export interface PaintNode extends Node<PaintProps> {
  addShader(shader: DeclarationNode<unknown, SkShader>): void;
  removeShader(): void;

  addMaskFilter(maskFilter: DeclarationNode<unknown, SkMaskFilter>): void;
  removeMaskFilter(): void;

  addColorFilter(colorFilter: DeclarationNode<unknown, SkColorFilter>): void;
  removeColorFilter(): void;

  addImageFilter(imageFilter: DeclarationNode<unknown, SkImageFilter>): void;
  removeImageFilter(): void;

  addPathEffect(pathEffect: DeclarationNode<unknown, SkPathEffect>): void;
  removePathEffect(): void;
}

export interface DrawingNodeProps {
  // TODO: to remove (handled by Group)
  paint?: SkPaint;
}

export interface DrawingNode<P extends DrawingNodeProps> extends RenderNode<P> {
  addPaint(paintNode: Node<PaintProps>): void;
  removePaint(paintNode: Node<PaintProps>): void;
  insertPaintBefore(
    paintNode: Node<PaintProps>,
    before: Node<PaintProps>
  ): void;
}
