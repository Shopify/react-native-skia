"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var _exportNames = {
  makeOffscreenSurface: true,
  getSkiaExports: true,
  drawOffscreen: true
};
exports.makeOffscreenSurface = exports.getSkiaExports = exports.drawOffscreen = void 0;
var _web = require("../skia/web");
var _Reconciler = require("../sksg/Reconciler");
var _components = require("../renderer/components");
Object.keys(_components).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _components[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _components[key];
    }
  });
});
var _types = require("../skia/types");
Object.keys(_types).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _types[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _types[key];
    }
  });
});
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore

let Skia;
const makeOffscreenSurface = (width, height) => {
  if (!Skia) {
    Skia = (0, _web.JsiSkApi)(CanvasKit);
  }
  const surface = Skia.Surface.MakeOffscreen(width, height);
  if (surface === null) {
    throw new Error("Couldn't create surface!");
  }
  return surface;
};
exports.makeOffscreenSurface = makeOffscreenSurface;
const getSkiaExports = () => {
  if (!Skia) {
    Skia = (0, _web.JsiSkApi)(CanvasKit);
  }
  return {
    Skia
  };
};
exports.getSkiaExports = getSkiaExports;
const drawOffscreen = (surface, element) => {
  const root = new _Reconciler.SkiaSGRoot(Skia);
  root.render(element);
  const canvas = surface.getCanvas();
  root.drawOnCanvas(canvas);
  root.unmount();
  surface.flush();
  return surface.makeImageSnapshot();
};
exports.drawOffscreen = drawOffscreen;
//# sourceMappingURL=index.js.map