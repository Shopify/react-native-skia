import type { GroupProps } from "./Common";
import type { NodeType } from "./NodeType";
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
    setInvalidate(invalidate: Invalidate): void;
}
export type RenderNode<P extends GroupProps> = Node<P>;
