"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.JsiSkTypefaceFontProvider = void 0;
var _Host = require("./Host");
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
class JsiSkTypefaceFontProvider extends _Host.HostObject {
  constructor(CanvasKit, ref) {
    super(CanvasKit, ref, "FontMgr");
    _defineProperty(this, "allocatedPointers", []);
  }
  matchFamilyStyle(_name, _style) {
    return (0, _Host.throwNotImplementedOnRNWeb)();
  }
  countFamilies() {
    return this.ref.countFamilies();
  }
  getFamilyName(index) {
    return this.ref.getFamilyName(index);
  }
  registerFont(typeface, familyName) {
    const strLen = lengthBytesUTF8(familyName) + 1;

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    const strPtr = this.CanvasKit._malloc(strLen);
    stringToUTF8(this.CanvasKit, familyName, strPtr, strLen);

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    this.ref._registerFont(typeface.ref, strPtr);
  }
  dispose() {
    for (const ptr of this.allocatedPointers) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      this.CanvasKit._free(ptr);
    }
    this.ref.delete();
  }
}
exports.JsiSkTypefaceFontProvider = JsiSkTypefaceFontProvider;
const lengthBytesUTF8 = str => {
  // TextEncoder will give us the byte length in UTF8 form
  const encoder = new TextEncoder();
  const utf8 = encoder.encode(str);
  return utf8.length;
};
const stringToUTF8 = (CanvasKit, str, outPtr, maxBytesToWrite) => {
  // TextEncoder will give us the byte array in UTF8 form
  const encoder = new TextEncoder();
  const utf8 = encoder.encode(str);
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  const heap = CanvasKit.HEAPU8;

  // Check if there's enough space
  if (utf8.length > maxBytesToWrite) {
    throw new Error("Not enough space to write UTF8 encoded string");
  }

  // Copy the bytes
  for (let i = 0; i < utf8.length; i++) {
    heap[outPtr + i] = utf8[i];
  }

  // Null terminate
  if (utf8.length < maxBytesToWrite) {
    heap[outPtr + utf8.length] = 0;
  }
};
//# sourceMappingURL=JsiSkTypefaceFontProvider.js.map