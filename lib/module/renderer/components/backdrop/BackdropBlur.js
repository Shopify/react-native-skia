function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
import React from "react";
import { Blur } from "../imageFilters";
import { BackdropFilter } from "./BackdropFilter";
export const BackdropBlur = ({
  blur,
  children,
  ...props
}) => {
  return /*#__PURE__*/React.createElement(BackdropFilter, _extends({
    filter: /*#__PURE__*/React.createElement(Blur, {
      blur: blur,
      mode: "clamp"
    })
  }, props), children);
};
//# sourceMappingURL=BackdropBlur.js.map