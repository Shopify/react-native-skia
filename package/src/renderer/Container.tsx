import type { DrawingContext, GroupNode, SkDOM } from "../dom/types";

import type { DependencyManager } from "./DependencyManager";

export class Container {
  private _root: GroupNode | null;

  constructor(
    public Sk: SkDOM,
    public depMgr: DependencyManager,
    public redraw: () => void
  ) {
    this._root = Sk.Group();
  }

  draw(ctx: DrawingContext) {
    if (!this._root) {
      throw new Error("Container has been cleared");
    }
    this._root.render(ctx);
  }

  get root() {
    if (!this._root) {
      throw new Error("Container has been cleared");
    }
    return this._root;
  }

  clear() {
    this._root = null;
  }
}
