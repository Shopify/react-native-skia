"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.BackdropFilter = void 0;
var _react = _interopRequireDefault(require("react"));
var _Group = require("../Group");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const BackdropFilter = ({
  filter,
  children: groupChildren,
  ...props
}) => {
  return /*#__PURE__*/_react.default.createElement(_Group.Group, props, /*#__PURE__*/_react.default.createElement("skBackdropFilter", null, filter), groupChildren);
};
exports.BackdropFilter = BackdropFilter;
//# sourceMappingURL=BackdropFilter.js.map