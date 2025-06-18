"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.throwNotImplementedOnRNWeb = exports.optEnum = exports.getEnum = exports.HostObject = exports.Host = exports.BaseHostObject = void 0;
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
const throwNotImplementedOnRNWeb = () => {
  if (typeof jest !== "undefined") {
    return jest.fn();
  }
  throw new Error("Not implemented on React Native Web");
};
exports.throwNotImplementedOnRNWeb = throwNotImplementedOnRNWeb;
class Host {
  constructor(CanvasKit) {
    _defineProperty(this, "CanvasKit", void 0);
    this.CanvasKit = CanvasKit;
  }
}
exports.Host = Host;
class BaseHostObject extends Host {
  constructor(CanvasKit, ref, typename) {
    super(CanvasKit);
    _defineProperty(this, "__typename__", void 0);
    _defineProperty(this, "ref", void 0);
    this.ref = ref;
    this.__typename__ = typename;
  }
}
exports.BaseHostObject = BaseHostObject;
class HostObject extends BaseHostObject {
  static fromValue(value) {
    return value.ref;
  }
}
exports.HostObject = HostObject;
const getEnum = (CanvasKit, name, v) => {
  const e = CanvasKit[name];
  if (typeof e !== "function") {
    throw new Error(`${name} is not an number`);
  }
  const result = Object.values(e).find(({
    value
  }) => value === v);
  if (!result) {
    throw new Error(`Enum ${name} does not have value ${v} on React Native Web`);
  }
  return result;
};
exports.getEnum = getEnum;
const optEnum = (CanvasKit, name, v) => {
  return v === undefined ? undefined : getEnum(CanvasKit, name, v);
};
exports.optEnum = optEnum;
//# sourceMappingURL=Host.js.map