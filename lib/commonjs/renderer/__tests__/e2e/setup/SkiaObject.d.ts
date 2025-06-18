import type { SkJSIInstance, Skia } from "../../../../skia/types";
import type { EvalContext } from "../../setup";
export declare abstract class SkiaObject<Ctx extends EvalContext, R extends SkJSIInstance<string>> {
    _context: Ctx;
    protected _source: string;
    protected _instance: R;
    constructor(Skia: Skia, fn: (Skia: Skia, ctx: Ctx) => R, _context: Ctx);
    get source(): string;
    get context(): Ctx;
    get instance(): R;
}
