function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
import React from "react";
export const BlurMask = ({
  style = "normal",
  respectCTM = true,
  ...props
}) => {
  return /*#__PURE__*/React.createElement("skBlurMaskFilter", _extends({
    style: style,
    respectCTM: respectCTM
  }, props));
};
//# sourceMappingURL=Blur.js.map