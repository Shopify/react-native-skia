import type {
  GroupProps,
  DrawingContext,
  RenderNode,
  SkDOM,
} from "../dom/types";

import type { DependencyManager } from "./DependencyManager";

export class Container {
  private _root: RenderNode<GroupProps>;

  constructor(
    public Sk: SkDOM,
    public depMgr: DependencyManager,
    public redraw: () => void
  ) {
    this._root = this.Sk.Group();
  }

  draw(ctx: DrawingContext) {
    this._root.render(ctx);
  }

  get root() {
    return this._root;
  }

  clear() {
    // TODO: unscribe all
    this._root = this.Sk.Group();
  }
}
