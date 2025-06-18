function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
import React from "react";
export const Path = ({
  start = 0,
  end = 1,
  ...props
}) => {
  return /*#__PURE__*/React.createElement("skPath", _extends({
    start: start,
    end: end
  }, props));
};
//# sourceMappingURL=Path.js.map