import { NodeType } from "../dom/types";
export const isColorFilter = type => {
  "worklet";

  return type === NodeType.BlendColorFilter || type === NodeType.MatrixColorFilter || type === NodeType.LerpColorFilter || type === NodeType.LumaColorFilter || type === NodeType.SRGBToLinearGammaColorFilter || type === NodeType.LinearToSRGBGammaColorFilter;
};
export const isPathEffect = type => {
  "worklet";

  return type === NodeType.DiscretePathEffect || type === NodeType.DashPathEffect || type === NodeType.Path1DPathEffect || type === NodeType.Path2DPathEffect || type === NodeType.CornerPathEffect || type === NodeType.SumPathEffect || type === NodeType.Line2DPathEffect;
};
export const isImageFilter = type => {
  "worklet";

  return type === NodeType.OffsetImageFilter || type === NodeType.DisplacementMapImageFilter || type === NodeType.BlurImageFilter || type === NodeType.DropShadowImageFilter || type === NodeType.MorphologyImageFilter || type === NodeType.BlendImageFilter || type === NodeType.RuntimeShaderImageFilter;
};
export const isShader = type => {
  "worklet";

  return type === NodeType.Shader || type === NodeType.ImageShader || type === NodeType.ColorShader || type === NodeType.Turbulence || type === NodeType.FractalNoise || type === NodeType.LinearGradient || type === NodeType.RadialGradient || type === NodeType.SweepGradient || type === NodeType.TwoPointConicalGradient;
};
export const sortNodeChildren = parent => {
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
    } else if (node.type === NodeType.BlurMaskFilter) {
      maskFilters.push(node);
    } else if (isPathEffect(node.type)) {
      pathEffects.push(node);
    } else if (isImageFilter(node.type)) {
      imageFilters.push(node);
    } else if (isShader(node.type)) {
      shaders.push(node);
    } else if (node.type === NodeType.Paint) {
      paints.push(node);
    } else if (node.type === NodeType.Blend) {
      if (node.children[0] && isImageFilter(node.children[0].type)) {
        node.type = NodeType.BlendImageFilter;
        imageFilters.push(node);
      } else {
        node.type = NodeType.Blend;
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
//# sourceMappingURL=Node.js.map