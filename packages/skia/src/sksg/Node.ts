import { NodeType } from "../dom/types";

export interface SortedChildren {
  colorFilters: Node[];
  drawings: Node[];
  maskFilters: Node[];
  shaders: Node[];
  pathEffects: Node[];
  imageFilters: Node[];
  paints: Node[];
}

export interface Node<Props = unknown> {
  type: NodeType;
  props: Props;
  children: Node[];
  // Cached sorted children - computed once when children are finalized
  sorted?: SortedChildren;
}

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
    type === NodeType.ImageFilter ||
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

// Reusable empty array to avoid allocation when no children of a type exist
const EMPTY_ARRAY: Node[] = [];

// Empty result for nodes with no children
const EMPTY_SORTED: SortedChildren = {
  colorFilters: EMPTY_ARRAY,
  drawings: EMPTY_ARRAY,
  maskFilters: EMPTY_ARRAY,
  shaders: EMPTY_ARRAY,
  pathEffects: EMPTY_ARRAY,
  imageFilters: EMPTY_ARRAY,
  paints: EMPTY_ARRAY,
};

/**
 * Computes and caches sorted children for a node.
 * This should be called once when the node's children are finalized.
 */
export const computeSortedChildren = (parent: Node): SortedChildren => {
  "worklet";
  const { children } = parent;
  const len = children.length;

  // Fast path: no children
  if (len === 0) {
    parent.sorted = EMPTY_SORTED;
    return EMPTY_SORTED;
  }

  // Allocate arrays only when needed
  let maskFilters: Node[] | null = null;
  let colorFilters: Node[] | null = null;
  let shaders: Node[] | null = null;
  let imageFilters: Node[] | null = null;
  let pathEffects: Node[] | null = null;
  let drawings: Node[] | null = null;
  let paints: Node[] | null = null;

  for (let i = 0; i < len; i++) {
    const node = children[i];
    const type = node.type;

    if (isColorFilter(type)) {
      if (colorFilters === null) {
        colorFilters = [];
      }
      colorFilters.push(node);
    } else if (type === NodeType.BlurMaskFilter) {
      if (maskFilters === null) {
        maskFilters = [];
      }
      maskFilters.push(node);
    } else if (isPathEffect(type)) {
      if (pathEffects === null) {
        pathEffects = [];
      }
      pathEffects.push(node);
    } else if (isImageFilter(type)) {
      if (imageFilters === null) {
        imageFilters = [];
      }
      imageFilters.push(node);
    } else if (isShader(type)) {
      if (shaders === null) {
        shaders = [];
      }
      shaders.push(node);
    } else if (type === NodeType.Paint) {
      if (paints === null) {
        paints = [];
      }
      paints.push(node);
    } else if (type === NodeType.Blend) {
      if (node.children[0] && isImageFilter(node.children[0].type)) {
        node.type = NodeType.BlendImageFilter;
        if (imageFilters === null) {
          imageFilters = [];
        }
        imageFilters.push(node);
      } else {
        node.type = NodeType.Blend;
        if (shaders === null) {
          shaders = [];
        }
        shaders.push(node);
      }
    } else {
      if (drawings === null) {
        drawings = [];
      }
      drawings.push(node);
    }
  }

  const sorted: SortedChildren = {
    colorFilters: colorFilters ?? EMPTY_ARRAY,
    drawings: drawings ?? EMPTY_ARRAY,
    maskFilters: maskFilters ?? EMPTY_ARRAY,
    shaders: shaders ?? EMPTY_ARRAY,
    pathEffects: pathEffects ?? EMPTY_ARRAY,
    imageFilters: imageFilters ?? EMPTY_ARRAY,
    paints: paints ?? EMPTY_ARRAY,
  };

  parent.sorted = sorted;
  return sorted;
};

/**
 * Gets sorted children, using cache if available.
 */
export const sortNodeChildren = (parent: Node): SortedChildren => {
  "worklet";
  // Use cached result if available
  if (parent.sorted !== undefined) {
    return parent.sorted;
  }
  // Compute and cache
  return computeSortedChildren(parent);
};
