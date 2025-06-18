"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.processRect = exports.processRRect = exports.isEdge = exports.inflate = exports.deflate = void 0;
var _Radius = require("./Radius");
/* eslint-disable @typescript-eslint/no-explicit-any */

const isEdge = (pos, b) => {
  "worklet";

  return pos.x === b.x || pos.y === b.y || pos.x === b.width || pos.y === b.height;
};

// We have an issue to check property existence on JSI backed instances
exports.isEdge = isEdge;
const isRRectCtor = def => {
  "worklet";

  return def.rect === undefined;
};
// We have an issue to check property existence on JSI backed instances
const isRectCtor = def => {
  "worklet";

  return def.rect === undefined;
};
const processRect = (Skia, def) => {
  "worklet";

  if (isRectCtor(def)) {
    var _def$x, _def$y;
    return Skia.XYWHRect((_def$x = def.x) !== null && _def$x !== void 0 ? _def$x : 0, (_def$y = def.y) !== null && _def$y !== void 0 ? _def$y : 0, def.width, def.height);
  } else {
    return def.rect;
  }
};
exports.processRect = processRect;
const processRRect = (Skia, def) => {
  "worklet";

  if (isRRectCtor(def)) {
    var _def$r, _def$x2, _def$y2;
    const r = (0, _Radius.processRadius)(Skia, (_def$r = def.r) !== null && _def$r !== void 0 ? _def$r : 0);
    return Skia.RRectXY(Skia.XYWHRect((_def$x2 = def.x) !== null && _def$x2 !== void 0 ? _def$x2 : 0, (_def$y2 = def.y) !== null && _def$y2 !== void 0 ? _def$y2 : 0, def.width, def.height), r.x, r.y);
  } else {
    return def.rect;
  }
};
exports.processRRect = processRRect;
const inflate = (Skia, box, dx, dy, tx = 0, ty = 0) => {
  "worklet";

  return Skia.RRectXY(Skia.XYWHRect(box.rect.x - dx + tx, box.rect.y - dy + ty, box.rect.width + 2 * dx, box.rect.height + 2 * dy), box.rx + dx, box.ry + dy);
};
exports.inflate = inflate;
const deflate = (Skia, box, dx, dy, tx = 0, ty = 0) => {
  "worklet";

  return inflate(Skia, box, -dx, -dy, tx, ty);
};
exports.deflate = deflate;
//# sourceMappingURL=Rect.js.map