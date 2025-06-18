import React from "react";
import { Group } from "../Group";
export const BackdropFilter = ({
  filter,
  children: groupChildren,
  ...props
}) => {
  return /*#__PURE__*/React.createElement(Group, props, /*#__PURE__*/React.createElement("skBackdropFilter", null, filter), groupChildren);
};
//# sourceMappingURL=BackdropFilter.js.map