"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useTypeface = void 0;
var _Skia = require("../Skia");
var _Data = require("./Data");
const tfFactory = _Skia.Skia.Typeface.MakeFreeTypeFaceFromData.bind(_Skia.Skia.Typeface);

/**
 * Returns a Skia Typeface object
 * */
const useTypeface = (source, onError) => (0, _Data.useRawData)(source, tfFactory, onError);
exports.useTypeface = useTypeface;
//# sourceMappingURL=Typeface.js.map