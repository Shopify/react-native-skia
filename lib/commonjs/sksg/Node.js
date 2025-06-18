"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.sortNodeChildren = exports.isShader = exports.isPathEffect = exports.isImageFilter = exports.isColorFilter = void 0;
var _types = require("../dom/types");
const isColorFilter = type => {
  "worklet";

  return type === _types.NodeType.BlendColorFilter || type === _types.NodeType.MatrixColorFilter || type === _types.NodeType.LerpColorFilter || type === _types.NodeType.LumaColorFilter || type === _types.NodeType.SRGBToLinearGammaColorFilter || type === _types.NodeType.LinearToSRGBGammaColorFilter;
};
exports.isColorFilter = isColorFilter;
const isPathEffect = type => {
  "worklet";

  return type === _types.NodeType.DiscretePathEffect || type === _types.NodeType.DashPathEffect || type === _types.NodeType.Path1DPathEffect || type === _types.NodeType.Path2DPathEffect || type === _types.NodeType.CornerPathEffect || type === _types.NodeType.SumPathEffect || type === _types.NodeType.Line2DPathEffect;
};
exports.isPathEffect = isPathEffect;
const isImageFilter = type => {
  "worklet";

  return type === _types.NodeType.OffsetImageFilter || type === _types.NodeType.DisplacementMapImageFilter || type === _types.NodeType.BlurImageFilter || type === _types.NodeType.DropShadowImageFilter || type === _types.NodeType.MorphologyImageFilter || type === _types.NodeType.BlendImageFilter || type === _types.NodeType.RuntimeShaderImageFilter;
};
exports.isImageFilter = isImageFilter;
const isShader = type => {
  "worklet";

  return type === _types.NodeType.Shader || type === _types.NodeType.ImageShader || type === _types.NodeType.ColorShader || type === _types.NodeType.Turbulence || type === _types.NodeType.FractalNoise || type === _types.NodeType.LinearGradient || type === _types.NodeType.RadialGradient || type === _types.NodeType.SweepGradient || type === _types.NodeType.TwoPointConicalGradient;
};
exports.isShader = isShader;
const sortNodeChildren = parent => {
  "worklet";

  const maskFilters = [];
  const colorFilters = [];
  const shaders = [];
  const imageFilters = [];
  const pathEffects = [];
  const drawings = [];
  const paints = [];
  parent.children.forEach(node => {
    if (isColorFilter(node.type)) {
      colorFilters.push(node);
    } else if (node.type === _types.NodeType.BlurMaskFilter) {
      maskFilters.push(node);
    } else if (isPathEffect(node.type)) {
      pathEffects.push(node);
    } else if (isImageFilter(node.type)) {
      imageFilters.push(node);
    } else if (isShader(node.type)) {
      shaders.push(node);
    } else if (node.type === _types.NodeType.Paint) {
      paints.push(node);
    } else if (node.type === _types.NodeType.Blend) {
      if (node.children[0] && isImageFilter(node.children[0].type)) {
        node.type = _types.NodeType.BlendImageFilter;
        imageFilters.push(node);
      } else {
        node.type = _types.NodeType.Blend;
        shaders.push(node);
      }
    } else {
      drawings.push(node);
    }
  });
  return {
    colorFilters,
    drawings,
    maskFilters,
    shaders,
    pathEffects,
    imageFilters,
    paints
  };
};
exports.sortNodeChildren = sortNodeChildren;
//# sourceMappingURL=Node.js.map