"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TextHeightBehavior = exports.TextDirection = exports.TextAlign = void 0;
let TextDirection = exports.TextDirection = /*#__PURE__*/function (TextDirection) {
  TextDirection[TextDirection["RTL"] = 0] = "RTL";
  TextDirection[TextDirection["LTR"] = 1] = "LTR";
  return TextDirection;
}({});
let TextAlign = exports.TextAlign = /*#__PURE__*/function (TextAlign) {
  TextAlign[TextAlign["Left"] = 0] = "Left";
  TextAlign[TextAlign["Right"] = 1] = "Right";
  TextAlign[TextAlign["Center"] = 2] = "Center";
  TextAlign[TextAlign["Justify"] = 3] = "Justify";
  TextAlign[TextAlign["Start"] = 4] = "Start";
  TextAlign[TextAlign["End"] = 5] = "End";
  return TextAlign;
}({});
let TextHeightBehavior = exports.TextHeightBehavior = /*#__PURE__*/function (TextHeightBehavior) {
  TextHeightBehavior[TextHeightBehavior["All"] = 0] = "All";
  TextHeightBehavior[TextHeightBehavior["DisableFirstAscent"] = 1] = "DisableFirstAscent";
  TextHeightBehavior[TextHeightBehavior["DisableLastDescent"] = 2] = "DisableLastDescent";
  TextHeightBehavior[TextHeightBehavior["DisableAll"] = 3] = "DisableAll";
  return TextHeightBehavior;
}({});
//# sourceMappingURL=ParagraphStyle.js.map