import { NodeType } from "../dom/types";

export interface Node<Props = unknown> {
  type: NodeType;
  props: Props;
  children: Node[];
  __skChildrenVersion?: number;
  __skSortedChildren?: SortedChildrenCache;
}

export interface SortedChildren {
  colorFilters: Node[];
  maskFilters: Node[];
  shaders: Node[];
  imageFilters: Node[];
  pathEffects: Node[];
  drawings: Node[];
  paints: Node[];
}

type SortedChildrenCache = {
  version: number;
  buckets: SortedChildren;
};

const createBuckets = (): SortedChildren => ({
  colorFilters: [],
  maskFilters: [],
  shaders: [],
  imageFilters: [],
  pathEffects: [],
  drawings: [],
  paints: [],
});

const resetBuckets = (buckets: SortedChildren) => {
  buckets.colorFilters.length = 0;
  buckets.maskFilters.length = 0;
  buckets.shaders.length = 0;
  buckets.imageFilters.length = 0;
  buckets.pathEffects.length = 0;
  buckets.drawings.length = 0;
  buckets.paints.length = 0;
};

export const bumpChildrenVersion = (node: Node) => {
  node.__skChildrenVersion = (node.__skChildrenVersion ?? 0) + 1;
};

export const getChildrenVersion = (node: Node) => {
  return node.__skChildrenVersion ?? 0;
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

export const sortNodeChildren = (parent: Node): SortedChildren => {
  "worklet";
  const version = getChildrenVersion(parent);
  let cache = parent.__skSortedChildren;

  // Return cached result if version matches
  if (cache && cache.version === version) {
    return cache.buckets;
  }

  // Create or reset cache
  if (!cache) {
    cache = {
      version,
      buckets: createBuckets(),
    };
    parent.__skSortedChildren = cache;
  } else {
    cache.version = version;
    resetBuckets(cache.buckets);
  }

  const buckets = cache.buckets;
  const children = parent.children;
  const len = children.length;

  for (let i = 0; i < len; i++) {
    const node = children[i];
    const type = node.type;
    if (isColorFilter(type)) {
      buckets.colorFilters.push(node);
    } else if (type === NodeType.BlurMaskFilter) {
      buckets.maskFilters.push(node);
    } else if (isPathEffect(type)) {
      buckets.pathEffects.push(node);
    } else if (isImageFilter(type)) {
      buckets.imageFilters.push(node);
    } else if (isShader(type)) {
      buckets.shaders.push(node);
    } else if (type === NodeType.Paint) {
      buckets.paints.push(node);
    } else if (type === NodeType.Blend) {
      if (node.children[0] && isImageFilter(node.children[0].type)) {
        node.type = NodeType.BlendImageFilter;
        buckets.imageFilters.push(node);
      } else {
        node.type = NodeType.Blend;
        buckets.shaders.push(node);
      }
    } else {
      buckets.drawings.push(node);
    }
  }

  return buckets;
};
