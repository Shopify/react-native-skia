"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.JsiSkSVGFactory = void 0;
var _Host = require("./Host");
var _JsiSkSVG = require("./JsiSkSVG");
class JsiSkSVGFactory extends _Host.Host {
  constructor(CanvasKit) {
    super(CanvasKit);
  }
  MakeFromData(data) {
    const decoder = new TextDecoder("utf-8");
    const str = decoder.decode(data.ref);
    return this.MakeFromString(str);
  }
  MakeFromString(str) {
    const parser = new DOMParser();
    const svgDoc = parser.parseFromString(str, "image/svg+xml");
    const svgElement = svgDoc.documentElement;
    const attrWidth = svgElement.getAttribute("width");
    const attrHeight = svgElement.getAttribute("height");
    let width = attrWidth ? parseFloat(attrWidth) : null;
    let height = attrHeight ? parseFloat(attrHeight) : null;
    const svgDataUrl = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(str);
    // Create a new HTMLImageElement
    const img = new Image();
    img.src = svgDataUrl;

    // Optionally set styles or attributes on the image
    img.style.display = "none";
    img.alt = "SVG Image";
    if (!width || !height) {
      const viewBox = svgElement.getAttribute("viewBox");
      if (viewBox) {
        const viewBoxValues = viewBox.split(" ");
        if (viewBoxValues.length === 4) {
          width = width || parseFloat(viewBoxValues[2]);
          height = height || parseFloat(viewBoxValues[3]);
        }
      }
    }
    if (width && height) {
      img.width = width;
      img.height = height;
    }
    img.onerror = e => {
      console.error("SVG failed to load", e);
    };
    document.body.appendChild(img);
    return new _JsiSkSVG.JsiSkSVG(this.CanvasKit, img);
  }
}
exports.JsiSkSVGFactory = JsiSkSVGFactory;
//# sourceMappingURL=JsiSkSVGFactory.js.map