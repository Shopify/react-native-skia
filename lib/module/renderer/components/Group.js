function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
import React, { isValidElement } from "react";
export const Group = ({
  layer,
  ...props
}) => {
  if (/*#__PURE__*/isValidElement(layer) && typeof layer === "object") {
    return /*#__PURE__*/React.createElement("skLayer", null, layer, /*#__PURE__*/React.createElement("skGroup", props));
  }
  return /*#__PURE__*/React.createElement("skGroup", _extends({
    layer: layer
  }, props));
};
//# sourceMappingURL=Group.js.map