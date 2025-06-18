"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.JsiSkPathFactory = void 0;
var _Host = require("./Host");
var _JsiSkPath = require("./JsiSkPath");
class JsiSkPathFactory extends _Host.Host {
  constructor(CanvasKit) {
    super(CanvasKit);
  }
  Make() {
    return new _JsiSkPath.JsiSkPath(this.CanvasKit, new this.CanvasKit.Path());
  }
  MakeFromSVGString(str) {
    const path = this.CanvasKit.Path.MakeFromSVGString(str);
    if (path === null) {
      return null;
    }
    return new _JsiSkPath.JsiSkPath(this.CanvasKit, path);
  }
  MakeFromOp(one, two, op) {
    const path = this.CanvasKit.Path.MakeFromOp(_JsiSkPath.JsiSkPath.fromValue(one), _JsiSkPath.JsiSkPath.fromValue(two), (0, _Host.getEnum)(this.CanvasKit, "PathOp", op));
    if (path === null) {
      return null;
    }
    return new _JsiSkPath.JsiSkPath(this.CanvasKit, path);
  }
  MakeFromCmds(cmds) {
    const path = this.CanvasKit.Path.MakeFromCmds(cmds.flat());
    if (path === null) {
      return null;
    }
    return new _JsiSkPath.JsiSkPath(this.CanvasKit, path);
  }
  MakeFromText(_text, _x, _y, _font) {
    return (0, _Host.throwNotImplementedOnRNWeb)();
  }
}
exports.JsiSkPathFactory = JsiSkPathFactory;
//# sourceMappingURL=JsiSkPathFactory.js.map