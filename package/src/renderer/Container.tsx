import { JsiSkDOM } from "../dom/nodes";
import type {
  GroupProps,
  DrawingContext,
  RenderNode,
  SkDOM,
} from "../dom/types";
import type { Skia } from "../skia/types";

export class Container {
  private _root: RenderNode<GroupProps>;
  public Sk: SkDOM;
  constructor(
    Skia: Skia,
    public redraw: () => void = () => {},
    public getNativeId: () => number = () => 0,
    native: boolean
  ) {
    this.Sk = new JsiSkDOM({ Skia }, native);
    this._root = this.Sk.Group();
  }

  draw(ctx: DrawingContext) {
    this._root.render(ctx);
  }

  get root() {
    return this._root;
  }
}
