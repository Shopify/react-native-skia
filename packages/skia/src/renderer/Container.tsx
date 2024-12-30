import { JsiSkDOM } from "../dom/nodes";
import type {
  Node,
  SkDOM,
} from "../dom/types";

export class Container {
  private _root: Node<unknown>;
  public Sk: SkDOM;
  public unmounted = false;
  constructor(
    public redraw: () => void = () => {},
    public getNativeId: () => number = () => 0
  ) {
    this.Sk = new JsiSkDOM();
    this._root = this.Sk.Group();
  }


  get root() {
    return this._root;
  }
}
