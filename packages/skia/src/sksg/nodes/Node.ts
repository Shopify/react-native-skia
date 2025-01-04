import { NodeType } from "../../dom/types";

export interface Node<Props = unknown> {
  type: NodeType;
  isDeclaration: boolean;
  props: Props;
  children: Node[];
}

// TODO: Remove
export const sortNodes = (children: Node[]) => {
  "worklet";
  const declarations: Node[] = [];
  const drawings: Node[] = [];

  children.forEach((node) => {
    if (node.isDeclaration) {
      declarations.push(node);
    } else {
      drawings.push(node);
    }
  });

  return { declarations, drawings };
};

export const sortNodeChildren = (parent: Node) => {
  "worklet";
  const maskFilters: Node[] = [];
  const colorFilters: Node[] = [];
  const shaders: Node[] = [];
  const imageFilters: Node[] = [];
  const pathEffects: Node[] = [];
  const drawings: Node[] = [];
  const declarations: Node[] = [];
  parent.children.forEach((node) => {
    if (
      node.type === NodeType.BlendColorFilter ||
      node.type === NodeType.MatrixColorFilter ||
      node.type === NodeType.LerpColorFilter ||
      node.type === NodeType.LumaColorFilter ||
      node.type === NodeType.SRGBToLinearGammaColorFilter ||
      node.type === NodeType.LinearToSRGBGammaColorFilter
    ) {
      colorFilters.push(node);
    } else if (node.type === NodeType.BlurMaskFilter) {
      maskFilters.push(node);
    } else if (
      // Path Effects
      node.type === NodeType.DiscretePathEffect ||
      node.type === NodeType.DashPathEffect ||
      node.type === NodeType.Path1DPathEffect ||
      node.type === NodeType.Path2DPathEffect ||
      node.type === NodeType.CornerPathEffect ||
      node.type === NodeType.SumPathEffect ||
      node.type === NodeType.Line2DPathEffect
    ) {
      pathEffects.push(node);
    } else if (
      // Image Filters
      node.type === NodeType.OffsetImageFilter ||
      node.type === NodeType.DisplacementMapImageFilter ||
      node.type === NodeType.BlurImageFilter ||
      node.type === NodeType.DropShadowImageFilter ||
      node.type === NodeType.MorphologyImageFilter ||
      node.type === NodeType.BlendImageFilter ||
      node.type === NodeType.RuntimeShaderImageFilter
    ) {
      imageFilters.push(node);
    } else if (
      // Shaders
      node.type === NodeType.Shader ||
      node.type === NodeType.ImageShader ||
      node.type === NodeType.ColorShader ||
      node.type === NodeType.Turbulence ||
      node.type === NodeType.FractalNoise ||
      node.type === NodeType.LinearGradient ||
      node.type === NodeType.RadialGradient ||
      node.type === NodeType.SweepGradient ||
      node.type === NodeType.TwoPointConicalGradient
    ) {
      shaders.push(node);
    } else if (node.isDeclaration) {
      declarations.push(node);
    } else {
      drawings.push(node);
    }
  });
  return {
    colorFilters,
    drawings,
    declarations,
    maskFilters,
    shaders,
    pathEffects,
    imageFilters,
  };
};
