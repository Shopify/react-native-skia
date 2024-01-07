import type { SkJSIInstance, Skia } from "../../../../skia/types";
import type { EvalContext } from "../../setup";

export abstract class SkiaObject<
  Ctx extends EvalContext,
  R extends SkJSIInstance<string>
> {
  protected _source: string;
  protected instance: R;

  constructor(
    Skia: Skia,
    fn: (Skia: Skia, ctx: Ctx) => R,
    public _context: Ctx
  ) {
    this._source = fn.toString();
    this.instance = fn(Skia, _context);
  }

  get source() {
    return this._source;
  }

  get context() {
    return this._context;
  }
}
