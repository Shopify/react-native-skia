"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PlaceholderAlignment = void 0;
let PlaceholderAlignment = exports.PlaceholderAlignment = /*#__PURE__*/function (PlaceholderAlignment) {
  /// Match the baseline of the placeholder with the baseline.
  PlaceholderAlignment[PlaceholderAlignment["Baseline"] = 0] = "Baseline";
  /// Align the bottom edge of the placeholder with the baseline such that the
  /// placeholder sits on top of the baseline.
  PlaceholderAlignment[PlaceholderAlignment["AboveBaseline"] = 1] = "AboveBaseline";
  /// Align the top edge of the placeholder with the baseline specified in
  /// such that the placeholder hangs below the baseline.
  PlaceholderAlignment[PlaceholderAlignment["BelowBaseline"] = 2] = "BelowBaseline";
  /// Align the top edge of the placeholder with the top edge of the font.
  /// When the placeholder is very tall, the extra space will hang from
  /// the top and extend through the bottom of the line.
  PlaceholderAlignment[PlaceholderAlignment["Top"] = 3] = "Top";
  /// Align the bottom edge of the placeholder with the top edge of the font.
  /// When the placeholder is very tall, the extra space will rise from
  /// the bottom and extend through the top of the line.
  PlaceholderAlignment[PlaceholderAlignment["Bottom"] = 4] = "Bottom";
  /// Align the middle of the placeholder with the middle of the text. When the
  /// placeholder is very tall, the extra space will grow equally from
  /// the top and bottom of the line.
  PlaceholderAlignment[PlaceholderAlignment["Middle"] = 5] = "Middle";
  return PlaceholderAlignment;
}({});
//# sourceMappingURL=ParagraphBuilder.js.map