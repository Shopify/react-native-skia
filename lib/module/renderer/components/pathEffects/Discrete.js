function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
import React from "react";
export const DiscretePathEffect = ({
  seed = 0,
  ...props
}) => {
  return /*#__PURE__*/React.createElement("skDiscretePathEffect", _extends({
    seed: seed
  }, props));
};
//# sourceMappingURL=Discrete.js.map