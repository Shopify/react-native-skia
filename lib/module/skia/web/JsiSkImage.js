function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
import { getEnum, HostObject } from "./Host";
import { JsiSkMatrix } from "./JsiSkMatrix";
import { JsiSkShader } from "./JsiSkShader";

// https://github.com/google/skia/blob/1f193df9b393d50da39570dab77a0bb5d28ec8ef/modules/canvaskit/htmlcanvas/util.js
export const toBase64String = bytes => {
  if (typeof Buffer !== "undefined") {
    // Are we on node?
    return Buffer.from(bytes).toString("base64");
  } else {
    // From https://stackoverflow.com/a/25644409
    // because the naive solution of
    //     btoa(String.fromCharCode.apply(null, bytes));
    // would occasionally throw "Maximum call stack size exceeded"
    var CHUNK_SIZE = 0x8000; //arbitrary number
    var index = 0;
    var {
      length
    } = bytes;
    var result = "";
    var slice;
    while (index < length) {
      slice = bytes.slice(index, Math.min(index + CHUNK_SIZE, length));
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      result += String.fromCharCode.apply(null, slice);
      index += CHUNK_SIZE;
    }
    return btoa(result);
  }
};
export class JsiSkImage extends HostObject {
  constructor(CanvasKit, ref) {
    super(CanvasKit, ref, "Image");
    _defineProperty(this, "dispose", () => {
      this.ref.delete();
    });
  }
  height() {
    return this.ref.height();
  }
  width() {
    return this.ref.width();
  }
  getImageInfo() {
    const info = this.ref.getImageInfo();
    return {
      width: info.width,
      height: info.height,
      colorType: info.colorType.value,
      alphaType: info.alphaType.value
    };
  }
  makeShaderOptions(tx, ty, fm, mm, localMatrix) {
    return new JsiSkShader(this.CanvasKit, this.ref.makeShaderOptions(getEnum(this.CanvasKit, "TileMode", tx), getEnum(this.CanvasKit, "TileMode", ty), getEnum(this.CanvasKit, "FilterMode", fm), getEnum(this.CanvasKit, "MipmapMode", mm), localMatrix ? JsiSkMatrix.fromValue(localMatrix) : undefined));
  }
  makeShaderCubic(tx, ty, B, C, localMatrix) {
    return new JsiSkShader(this.CanvasKit, this.ref.makeShaderCubic(getEnum(this.CanvasKit, "TileMode", tx), getEnum(this.CanvasKit, "TileMode", ty), B, C, localMatrix ? JsiSkMatrix.fromValue(localMatrix) : undefined));
  }
  encodeToBytes(fmt, quality) {
    let result;
    if (fmt && quality) {
      result = this.ref.encodeToBytes(getEnum(this.CanvasKit, "ImageFormat", fmt), quality);
    } else if (fmt) {
      result = this.ref.encodeToBytes(getEnum(this.CanvasKit, "ImageFormat", fmt));
    } else {
      result = this.ref.encodeToBytes();
    }
    if (!result) {
      throw new Error("encodeToBytes failed");
    }
    return result;
  }
  encodeToBase64(fmt, quality) {
    const bytes = this.encodeToBytes(fmt, quality);
    return toBase64String(bytes);
  }

  // TODO: this is leaking on Web
  // Add signature with allocated buffer
  readPixels(srcX, srcY, imageInfo) {
    var _imageInfo$width, _imageInfo$height;
    const info = this.getImageInfo();
    const pxInfo = {
      colorSpace: this.CanvasKit.ColorSpace.SRGB,
      width: (_imageInfo$width = imageInfo === null || imageInfo === void 0 ? void 0 : imageInfo.width) !== null && _imageInfo$width !== void 0 ? _imageInfo$width : info.width,
      height: (_imageInfo$height = imageInfo === null || imageInfo === void 0 ? void 0 : imageInfo.height) !== null && _imageInfo$height !== void 0 ? _imageInfo$height : info.height,
      alphaType: getEnum(this.CanvasKit, "AlphaType", (imageInfo !== null && imageInfo !== void 0 ? imageInfo : info).alphaType),
      colorType: getEnum(this.CanvasKit, "ColorType", (imageInfo !== null && imageInfo !== void 0 ? imageInfo : info).colorType)
    };
    return this.ref.readPixels(srcX !== null && srcX !== void 0 ? srcX : 0, srcY !== null && srcY !== void 0 ? srcY : 0, pxInfo);
  }
  makeNonTextureImage() {
    // if the image is already a non-texture image, this is a no-op
    const partialInfo = this.ref.getImageInfo();
    const colorSpace = this.ref.getColorSpace();
    const info = {
      ...partialInfo,
      colorSpace
    };
    const pixels = this.ref.readPixels(0, 0, info);
    if (!pixels) {
      throw new Error("Could not read pixels from image");
    }
    const img = this.CanvasKit.MakeImage(info, pixels, info.width * 4);
    if (!img) {
      throw new Error("Could not create image from bytes");
    }
    return new JsiSkImage(this.CanvasKit, img);
  }
  getNativeTextureUnstable() {
    console.warn("getBackendTexture is not implemented on Web");
    return null;
  }
}
//# sourceMappingURL=JsiSkImage.js.map