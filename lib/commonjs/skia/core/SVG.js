"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useSVG = void 0;
var _Skia = require("../Skia");
var _Data = require("./Data");
const svgFactory = _Skia.Skia.SVG.MakeFromData.bind(_Skia.Skia.SVG);
const useSVG = (source, onError) => (0, _Data.useRawData)(source, svgFactory, onError);
exports.useSVG = useSVG;
//# sourceMappingURL=SVG.js.map