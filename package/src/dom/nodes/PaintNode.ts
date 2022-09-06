import type { SkPaint, Skia } from "../../skia/types";
import type { DeclarationNode, Node, PaintProps } from "../types";
import { DeclarationType, NodeType } from "../types";

import { JsiDeclarationNode } from "./Node";

export class PaintNode
  extends JsiDeclarationNode<PaintProps, SkPaint>
  implements DeclarationNode<PaintProps, SkPaint>
{
  constructor(Skia: Skia, props: PaintProps = {}) {
    super(Skia, DeclarationType.Paint, NodeType.Paint, props);
    this.setInvalidate(() => {
      // TODO: this should do nothing in PaintNode: double check
      //console.log("invalidate paint");
    });
  }

  setProps(props: PaintProps) {
    super.setProps(props);
  }

  setProp<K extends keyof PaintProps>(name: K, v: PaintProps[K]) {
    super.setProp(name, v);
  }

  addChild(child: Node<unknown>): void {
    if (!(child instanceof JsiDeclarationNode)) {
      throw new Error(`Cannot add ${child.type} to ${this.type}`);
    }
    // child.setInvalidate(() => (this.cache = null));
    super.addChild(child);
  }

  insertChildBefore(child: Node<unknown>, before: Node<unknown>): void {
    if (!(child instanceof JsiDeclarationNode)) {
      throw new Error(`Cannot add ${child.type} to ${this.type}`);
    }
    // child.setInvalidate(() => (this.cache = null));
    super.insertChildBefore(child, before);
  }

  removeChild(child: Node<unknown>) {
    // this.cache = null;
    return super.removeChild(child);
  }

  get() {
    // TODO: IMPLEMENT
    return this.Skia.Paint();
    // return this.concat(this.Skia.Paint(), 1);
  }
}
