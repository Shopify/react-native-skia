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

export const isColorFilter = (type: NodeType) => {
  "worklet";
  return (
    type === NodeType.BlendColorFilter ||
    type === NodeType.MatrixColorFilter ||
    type === NodeType.LerpColorFilter ||
    type === NodeType.LumaColorFilter ||
    type === NodeType.SRGBToLinearGammaColorFilter ||
    type === NodeType.LinearToSRGBGammaColorFilter
  );
};

export const isPathEffect = (type: NodeType) => {
  "worklet";
  return (
    type === NodeType.DiscretePathEffect ||
    type === NodeType.DashPathEffect ||
    type === NodeType.Path1DPathEffect ||
    type === NodeType.Path2DPathEffect ||
    type === NodeType.CornerPathEffect ||
    type === NodeType.SumPathEffect ||
    type === NodeType.Line2DPathEffect
  );
};

export const isImageFilter = (type: NodeType) => {
  "worklet";
  return (
    type === NodeType.OffsetImageFilter ||
    type === NodeType.DisplacementMapImageFilter ||
    type === NodeType.BlurImageFilter ||
    type === NodeType.DropShadowImageFilter ||
    type === NodeType.MorphologyImageFilter ||
    type === NodeType.BlendImageFilter ||
    type === NodeType.RuntimeShaderImageFilter
  );
};

export const isShader = (type: NodeType) => {
  "worklet";
  return (
    type === NodeType.Shader ||
    type === NodeType.ImageShader ||
    type === NodeType.ColorShader ||
    type === NodeType.Turbulence ||
    type === NodeType.FractalNoise ||
    type === NodeType.LinearGradient ||
    type === NodeType.RadialGradient ||
    type === NodeType.SweepGradient ||
    type === NodeType.TwoPointConicalGradient
  );
};

export const sortNodeChildren = (parent: Node) => {
  "worklet";
  const maskFilters: Node[] = [];
  const colorFilters: Node[] = [];
  const shaders: Node[] = [];
  const imageFilters: Node[] = [];
  const pathEffects: Node[] = [];
  const drawings: Node[] = [];
  const paints: Node[] = [];
  const declarations: Node[] = [];
  parent.children.forEach((node) => {
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
    } else if (node.isDeclaration) {
      declarations.push(node);
    } else if (node.type === NodeType.Paint) {
      paints.push(node);
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
    paints,
  };
};
