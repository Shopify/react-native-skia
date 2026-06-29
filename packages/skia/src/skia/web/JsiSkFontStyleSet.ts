import type { CanvasKit } from "canvaskit-wasm";

import type {
  FontStyle,
  FontStyleEntry,
  SkFontStyleSet,
  SkTypeface,
} from "../types";

import { HostObject, throwNotImplementedOnRNWeb } from "./Host";

// SkFontStyleSet has no direct CanvasKit equivalent; this stub satisfies the
// interface on web while the native implementation uses JsiSkFontStyleSet.h.
export class JsiSkFontStyleSet
  extends HostObject<object, "FontStyleSet">
  implements SkFontStyleSet
{
  constructor(CanvasKit: CanvasKit) {
    super(CanvasKit, {}, "FontStyleSet");
  }

  count() {
    return throwNotImplementedOnRNWeb<number>();
  }
  getStyle(_index: number) {
    return throwNotImplementedOnRNWeb<FontStyleEntry>();
  }
  createTypeface(_index: number): SkTypeface | null {
    return throwNotImplementedOnRNWeb<SkTypeface | null>();
  }
  matchStyle(_style: FontStyle): SkTypeface | null {
    return throwNotImplementedOnRNWeb<SkTypeface | null>();
  }
}
