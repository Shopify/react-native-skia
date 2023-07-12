import type { CanvasKit, TypefaceFontProvider } from "canvaskit-wasm";

import type { SkTypefaceFontProvider } from "../types/Paragraph/TypefaceFontProvider";
import type { SkTypeface } from "../types";

import { HostObject } from "./Host";

export class JsiSkTypefaceFontProvider
  extends HostObject<TypefaceFontProvider, "TypefaceFontProvider">
  implements SkTypefaceFontProvider
{
  constructor(CanvasKit: CanvasKit, ref: TypefaceFontProvider) {
    super(CanvasKit, ref, "TypefaceFontProvider");
  }
  registerFont(typeface: SkTypeface, familyName: string) {
    //https://emscripten.org/docs/api_reference/preamble.js.html#stringToUTF8
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    const strLen = lengthBytesUTF8(familyName) + 1;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    const strPtr = this.CanvasKit._malloc(strLen);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    stringToUTF8(familyName, strPtr, strLen);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    this.CanvasKit._registerFont(typeface, strPtr);
  }

  dispose = () => {
    this.ref.delete();
  };
}
