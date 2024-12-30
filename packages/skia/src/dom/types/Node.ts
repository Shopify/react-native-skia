import type { GroupProps } from "./Common";
import type { NodeType } from "./NodeType";
import type { DeclarationContext } from "./DeclarationContext";

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
  //declarationType: DeclarationType;
  decorate(ctx: DeclarationContext): void;

  setInvalidate(invalidate: Invalidate): void;
}

export type RenderNode<P extends GroupProps> = Node<P>;
