import type { Skia } from "../../skia/types";
import type {
  Node,
  DeclarationNode,
  NodeType,
  DeclarationType,
} from "../types";
import type { DependencyManager } from "../../renderer/DependencyManager";
import type { DeclarationContext } from "../types/DeclarationContext";

export interface NodeContext {
  Skia: Skia;
  depMgr: DependencyManager;
}

export abstract class JsiNode<P> implements Node<P> {
  protected _children: JsiNode<unknown>[] = [];
  protected Skia: Skia;
  protected depMgr: DependencyManager;

  constructor(ctx: NodeContext, public type: NodeType, protected props: P) {
    this.Skia = ctx.Skia;
    this.depMgr = ctx.depMgr;
  }

  setProps(props: P) {
    this.props = props;
  }

  setProp<K extends keyof P>(name: K, v: P[K]) {
    const hasChanged = this.props[name] !== v;
    this.props[name] = v;
    return hasChanged;
  }

  getProps() {
    return this.props;
  }

  children() {
    return this._children;
  }

  addChild(child: Node<unknown>) {
    this._children.push(child as JsiNode<unknown>);
  }

  dispose() {
    this.depMgr.unsubscribeNode(this);
    this._children.forEach((child) => child.dispose());
  }

  removeChild(child: Node<unknown>) {
    const index = this._children.indexOf(child as JsiNode<unknown>);
    if (index !== -1) {
      const [node] = this._children.splice(index, 1);
      node.dispose();
    }
  }

  insertChildBefore(child: Node<unknown>, before: Node<unknown>) {
    const index = this._children.indexOf(child as JsiNode<unknown>);
    if (index !== -1) {
      this._children.splice(index, 1);
    }
    const beforeIndex = this._children.indexOf(before as JsiNode<unknown>);
    this._children.splice(beforeIndex, 0, child as JsiNode<unknown>);
  }
}

export type Invalidate = () => void;

export abstract class JsiDeclarationNode<P>
  extends JsiNode<P>
  implements DeclarationNode<P>
{
  private invalidate: Invalidate = () => {};

  constructor(
    ctx: NodeContext,
    public declarationType: DeclarationType,
    type: NodeType,
    props: P
  ) {
    super(ctx, type, props);
  }

  abstract decorate(ctx: DeclarationContext): void;

  protected decorateChildren(ctx: DeclarationContext) {
    this.children().forEach((child) => {
      if (child instanceof JsiDeclarationNode) {
        child.decorate(ctx);
      }
    });
  }

  addChild(child: Node<unknown>): void {
    if (!(child instanceof JsiDeclarationNode)) {
      throw new Error(`Cannot add child of type ${child.type} to ${this.type}`);
    }
    super.addChild(child);
    this.invalidate();
  }

  insertChildBefore(child: Node<unknown>, before: Node<unknown>): void {
    if (!(child instanceof JsiDeclarationNode)) {
      throw new Error(`Cannot add child of type ${child.type} to ${this.type}`);
    }
    super.insertChildBefore(child, before);
    this.invalidate();
  }

  dispose() {
    this.invalidate();
    super.dispose();
  }

  setInvalidate(invalidate: Invalidate) {
    this.invalidate = invalidate;
  }

  setProps(props: P) {
    super.setProps(props);
    this.invalidate();
  }

  setProp<K extends keyof P>(name: K, v: P[K]) {
    const hasChanged = super.setProp(name, v);
    if (hasChanged) {
      this.invalidate();
    }
    return hasChanged;
  }
}
