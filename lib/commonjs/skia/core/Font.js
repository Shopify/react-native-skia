"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useFonts = exports.useFont = exports.matchFont = exports.listFontFamilies = void 0;
var _react = require("react");
var _Skia = require("../Skia");
var _types = require("../types");
var _Platform = require("../../Platform");
var _Typeface = require("./Typeface");
/*global SkiaApi*/

const defaultFontSize = 14;

/**
 * Returns a Skia Font object
 * */
const useFont = (font, size = defaultFontSize, onError) => {
  const typeface = (0, _Typeface.useTypeface)(font, onError);
  return (0, _react.useMemo)(() => {
    if (typeface) {
      return _Skia.Skia.Font(typeface, size);
    } else {
      return null;
    }
  }, [size, typeface]);
};
exports.useFont = useFont;
const defaultFontStyle = {
  fontFamily: "System",
  fontSize: defaultFontSize,
  fontStyle: "normal",
  fontWeight: "normal"
};
const slant = s => {
  if (s === "italic") {
    return _types.FontSlant.Italic;
  } else if (s === "oblique") {
    return _types.FontSlant.Oblique;
  } else {
    return _types.FontSlant.Upright;
  }
};
const weight = fontWeight => {
  switch (fontWeight) {
    case "normal":
      return 400;
    case "bold":
      return 700;
    default:
      return parseInt(fontWeight, 10);
  }
};
const matchFont = (inputStyle = {}, fontMgr = _Skia.Skia.FontMgr.System()) => {
  const fontStyle = {
    ...defaultFontStyle,
    ...inputStyle
  };
  const style = {
    weight: weight(fontStyle.fontWeight),
    width: 5,
    slant: slant(fontStyle.fontStyle)
  };
  const typeface = fontMgr.matchFamilyStyle(fontStyle.fontFamily, style);
  return _Skia.Skia.Font(typeface, fontStyle.fontSize);
};
exports.matchFont = matchFont;
const listFontFamilies = (fontMgr = _Skia.Skia.FontMgr.System()) => new Array(fontMgr.countFamilies()).fill(0).map((_, i) => fontMgr.getFamilyName(i));
exports.listFontFamilies = listFontFamilies;
const loadTypefaces = typefacesToLoad => {
  const promises = Object.keys(typefacesToLoad).flatMap(familyName => {
    return typefacesToLoad[familyName].map(typefaceToLoad => {
      return _Skia.Skia.Data.fromURI(_Platform.Platform.resolveAsset(typefaceToLoad)).then(data => {
        const tf = _Skia.Skia.Typeface.MakeFreeTypeFaceFromData(data);
        if (tf === null) {
          throw new Error(`Couldn't create typeface for ${familyName}`);
        }
        return [familyName, tf];
      });
    });
  });
  return Promise.all(promises);
};
const useFonts = sources => {
  const [fontMgr, setFontMgr] = (0, _react.useState)(null);
  (0, _react.useEffect)(() => {
    loadTypefaces(sources).then(result => {
      const fMgr = _Skia.Skia.TypefaceFontProvider.Make();
      result.forEach(([familyName, typeface]) => {
        fMgr.registerFont(typeface, familyName);
      });
      setFontMgr(fMgr);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return fontMgr;
};
exports.useFonts = useFonts;
//# sourceMappingURL=Font.js.map