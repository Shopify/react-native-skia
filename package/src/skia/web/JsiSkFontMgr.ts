import type { CanvasKit, FontMgr } from "canvaskit-wasm";

import type { FontStyle, SkFontMgr, SkTypeface, WebFont } from "../types";

import { HostObject } from "./Host";
import { JsiSkTypeface } from "./JsiSkTypeface";

interface FontKey {
  familyName: string;
  fontStyle: FontStyle;
}

class TypefaceMap {
  private items: Map<string, JsiSkTypeface> = new Map();

  set(key: FontKey, value: JsiSkTypeface) {
    const hashKey = this.hash(key);
    this.items.set(hashKey, value);
  }

  get(key: FontKey) {
    const hashKey = this.hash(key);
    return this.items.get(hashKey);
  }

  getDefaultFont() {
    const tf = this.items.values().next().value;
    if (!tf) {
      throw new Error("No font available");
    }
    return tf;
  }

  private hash(key: FontKey): string {
    return `${key.familyName}:${key.fontStyle.width}:${key.fontStyle.slant}:${key.fontStyle.weight}`;
  }
}

export class JsiSkFontMgr
  extends HostObject<FontMgr, "FontMgr">
  implements SkFontMgr
{
  private typefaces: TypefaceMap;

  constructor(CanvasKit: CanvasKit, buffers: WebFont[]) {
    const ref = CanvasKit.FontMgr.FromData(
      ...buffers.map(({ typeface }) => typeface)
    );
    if (!ref) {
      throw new Error("Couldn't create a FontMgr");
    }
    super(CanvasKit, ref, "FontMgr");
    this.typefaces = new TypefaceMap();
    buffers.forEach(({ typeface, ...key }) => {
      const tf = CanvasKit.Typeface.MakeFreeTypeFaceFromData(typeface);
      if (!tf) {
        throw new Error("Couldn't create typeface");
      }
      this.typefaces.set(key, new JsiSkTypeface(CanvasKit, tf));
    });
  }
  dispose() {
    this.ref.delete();
  }
  countFamilies() {
    return this.ref.countFamilies();
  }
  getFamilyName(index: number) {
    return this.ref.getFamilyName(index);
  }
  matchFamilyStyle(familyName: string, fontStyle: FontStyle): SkTypeface {
    // https://github.com/google/skia/blob/main/src/ports/SkFontMgr_custom_embedded.cpp#L66
    const tf = this.typefaces.get({ familyName, fontStyle });
    if (!tf) {
      return this.typefaces.getDefaultFont();
    }
    return tf;
  }
}
