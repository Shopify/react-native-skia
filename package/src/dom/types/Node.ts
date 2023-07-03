import type { GroupProps } from "./Common";
import type { DeclarationType, NodeType } from "./NodeType";
import type { DeclarationContext } from "./DeclarationContext";
import type { DrawingContext } from "./DrawingContext";

export interface Node<P> {
  type: NodeType;

  setProps(props: P): void;
  setProp<K extends keyof P>(name: K, v: P[K]): boolean;
  getProps(): P;

  children(): Node<unknown>[];
  addChild(child: Node<unknown>): void;
  removeChild(child: Node<unknown>): void;
  insertChildBefore(child: Node<unknown>, before: Node<unknown>): void;
}

export type Invalidate = () => void;

export interface DeclarationNode<P> extends Node<P> {
  declarationType: DeclarationType;
  decorate(ctx: DeclarationContext): void;

  setInvalidate(invalidate: Invalidate): void;
}

export interface RenderNode<P extends GroupProps> extends Node<P> {
  render(ctx: DrawingContext): void;
}
