import { JsiSkDOM } from "../dom/nodes";
import type {
  GroupProps,
  DrawingContext,
  RenderNode,
  SkDOM,
} from "../dom/types";

export class Container {
  private _root: RenderNode<GroupProps>;
  public Sk: SkDOM;
  public unmounted = false;
  constructor(
    public redraw: () => void = () => {},
    public getNativeId: () => number = () => 0
  ) {
    this.Sk = new JsiSkDOM();
    this._root = this.Sk.Group();
  }

  draw(ctx: DrawingContext) {
    this._root.render(ctx);
  }

  get root() {
    return this._root;
  }
}
