/* eslint-disable @typescript-eslint/no-explicit-any */
import type {
  CTMProps,
  DrawingNodeProps,
  BoxShadowProps,
} from "../../dom/types";
import { NodeType } from "../../dom/types";
import type { BaseRecorder } from "../../skia/types/Recorder";
import type { Node } from "../Node";
import { isImageFilter, isShader, sortNodeChildren } from "../Node";
import type { AnimatedProps } from "../../renderer";

// WeakMap caches for computed props - keyed by node, invalidated when props reference changes
type NodePropsCache<T> = {
  props: object;
  value: T;
};

const getCachedValue = <T>(
  cache: WeakMap<Node<any>, NodePropsCache<T>>,
  node: Node<any>,
  props: object,
  compute: () => T
): T => {
  const cached = cache.get(node);
  if (cached && cached.props === props) {
    return cached.value;
  }
  const value = compute();
  cache.set(node, { props, value });
  return value;
};

const paintCache = new WeakMap<
  Node<any>,
  NodePropsCache<DrawingNodeProps | null>
>();
const ctmCache = new WeakMap<Node<any>, NodePropsCache<CTMProps | null>>();
const stackingContextCache = new WeakMap<
  Node<any>,
  NodePropsCache<AnimatedProps<Pick<DrawingNodeProps, "zIndex">> | undefined>
>();

export const processPaint = (props: DrawingNodeProps) => {
  const {
    opacity,
    color,
    strokeWidth,
    blendMode,
    style,
    strokeJoin,
    strokeCap,
    strokeMiter,
    antiAlias,
    dither,
    paint: paintRef,
  } = props;

  // Early return if no paint properties are defined
  if (
    opacity === undefined &&
    color === undefined &&
    strokeWidth === undefined &&
    blendMode === undefined &&
    style === undefined &&
    strokeJoin === undefined &&
    strokeCap === undefined &&
    strokeMiter === undefined &&
    antiAlias === undefined &&
    dither === undefined &&
    paintRef === undefined
  ) {
    return null;
  }

  const paint: DrawingNodeProps = {};
  if (opacity !== undefined) paint.opacity = opacity;
  if (color !== undefined) paint.color = color;
  if (strokeWidth !== undefined) paint.strokeWidth = strokeWidth;
  if (blendMode !== undefined) paint.blendMode = blendMode;
  if (style !== undefined) paint.style = style;
  if (strokeJoin !== undefined) paint.strokeJoin = strokeJoin;
  if (strokeCap !== undefined) paint.strokeCap = strokeCap;
  if (strokeMiter !== undefined) paint.strokeMiter = strokeMiter;
  if (antiAlias !== undefined) paint.antiAlias = antiAlias;
  if (dither !== undefined) paint.dither = dither;
  if (paintRef !== undefined) paint.paint = paintRef;

  return paint;
};

const processCTM = (props: CTMProps) => {
  const { clip, invertClip, transform, origin, matrix, layer } = props;

  // Early return if no CTM properties are defined
  if (
    clip === undefined &&
    invertClip === undefined &&
    transform === undefined &&
    origin === undefined &&
    matrix === undefined &&
    layer === undefined
  ) {
    return null;
  }

  const ctm: CTMProps = {};
  if (clip !== undefined) ctm.clip = clip;
  if (invertClip !== undefined) ctm.invertClip = invertClip;
  if (transform !== undefined) ctm.transform = transform;
  if (origin !== undefined) ctm.origin = origin;
  if (matrix !== undefined) ctm.matrix = matrix;
  if (layer !== undefined) ctm.layer = layer;

  return ctm;
};

// Cached getters that use WeakMap + props reference check
const getPaintForNode = (node: Node<any>): DrawingNodeProps | null => {
  const propsObj = node.props as object;
  return getCachedValue(paintCache, node, propsObj, () =>
    processPaint(node.props as DrawingNodeProps)
  );
};

const getCTMForNode = (node: Node<any>): CTMProps | null => {
  const propsObj = node.props as object;
  return getCachedValue(ctmCache, node, propsObj, () =>
    processCTM(node.props as CTMProps)
  );
};

const computeStackingContextProps = (
  props: AnimatedProps<DrawingNodeProps>
): AnimatedProps<Pick<DrawingNodeProps, "zIndex">> | undefined => {
  const { zIndex } = props;
  if (zIndex === undefined) {
    return undefined;
  }
  return { zIndex };
};

const getStackingContextForNode = (
  node: Node<any>
): AnimatedProps<Pick<DrawingNodeProps, "zIndex">> | undefined => {
  const propsObj = node.props as object;
  return getCachedValue(stackingContextCache, node, propsObj, () =>
    computeStackingContextProps(node.props as AnimatedProps<DrawingNodeProps>)
  );
};

const pushColorFilters = (
  recorder: BaseRecorder,
  colorFilters: Node<any>[]
) => {
  const len = colorFilters.length;
  for (let i = 0; i < len; i++) {
    const colorFilter = colorFilters[i];
    const childrenLen = colorFilter.children.length;
    if (childrenLen > 0) {
      pushColorFilters(recorder, colorFilter.children);
    }
    recorder.pushColorFilter(colorFilter.type, colorFilter.props);
    const needsComposition =
      colorFilter.type !== NodeType.LerpColorFilter && childrenLen > 0;
    if (needsComposition) {
      recorder.composeColorFilter();
    }
  }
};

const pushPathEffects = (recorder: BaseRecorder, pathEffects: Node<any>[]) => {
  const len = pathEffects.length;
  for (let i = 0; i < len; i++) {
    const pathEffect = pathEffects[i];
    const childrenLen = pathEffect.children.length;
    if (childrenLen > 0) {
      pushPathEffects(recorder, pathEffect.children);
    }
    recorder.pushPathEffect(pathEffect.type, pathEffect.props);
    const needsComposition =
      pathEffect.type !== NodeType.SumPathEffect && childrenLen > 0;
    if (needsComposition) {
      recorder.composePathEffect();
    }
  }
};

const pushImageFilters = (
  recorder: BaseRecorder,
  imageFilters: Node<any>[]
) => {
  const len = imageFilters.length;
  for (let i = 0; i < len; i++) {
    const imageFilter = imageFilters[i];
    const childrenLen = imageFilter.children.length;
    if (childrenLen > 0) {
      pushImageFilters(recorder, imageFilter.children);
    }
    const type = imageFilter.type;
    if (isImageFilter(type)) {
      recorder.pushImageFilter(type, imageFilter.props);
    } else if (isShader(type)) {
      recorder.pushShader(type, imageFilter.props, 0);
    }
    const needsComposition =
      type !== NodeType.BlendImageFilter && childrenLen > 0;
    if (needsComposition) {
      recorder.composeImageFilter();
    }
  }
};

const pushShaders = (recorder: BaseRecorder, shaders: Node<any>[]) => {
  const len = shaders.length;
  for (let i = 0; i < len; i++) {
    const shader = shaders[i];
    const childrenLen = shader.children.length;
    if (childrenLen > 0) {
      pushShaders(recorder, shader.children);
    }
    recorder.pushShader(shader.type, shader.props, childrenLen);
  }
};

const pushMaskFilters = (recorder: BaseRecorder, maskFilters: Node<any>[]) => {
  if (maskFilters.length > 0) {
    recorder.pushBlurMaskFilter(maskFilters[maskFilters.length - 1].props);
  }
};

const pushPaints = (recorder: BaseRecorder, paints: Node<any>[]) => {
  const len = paints.length;
  for (let i = 0; i < len; i++) {
    const paint = paints[i];
    recorder.savePaint(paint.props, true);
    const { colorFilters, maskFilters, shaders, imageFilters, pathEffects } =
      sortNodeChildren(paint);
    pushColorFilters(recorder, colorFilters);
    pushImageFilters(recorder, imageFilters);
    pushMaskFilters(recorder, maskFilters);
    pushShaders(recorder, shaders);
    pushPathEffects(recorder, pathEffects);
    recorder.restorePaintDeclaration();
  }
};

const visitNode = (recorder: BaseRecorder, node: Node<any>) => {
  const { props } = node;
  const stackingContextProps = getStackingContextForNode(node);
  recorder.saveGroup(stackingContextProps);
  const {
    colorFilters,
    maskFilters,
    drawings,
    shaders,
    imageFilters,
    pathEffects,
    paints,
  } = sortNodeChildren(node);
  const paint = getPaintForNode(node);
  const shouldPushPaint =
    paint ||
    colorFilters.length > 0 ||
    maskFilters.length > 0 ||
    imageFilters.length > 0 ||
    pathEffects.length > 0 ||
    shaders.length > 0;
  if (shouldPushPaint) {
    recorder.savePaint(paint ?? {}, false);
    pushColorFilters(recorder, colorFilters);
    pushImageFilters(recorder, imageFilters);
    pushMaskFilters(recorder, maskFilters);
    pushShaders(recorder, shaders);
    pushPathEffects(recorder, pathEffects);
    // For mixed nodes like BackdropFilters we don't materialize the paint
    if (node.type === NodeType.BackdropFilter) {
      recorder.saveBackdropFilter();
    } else {
      recorder.materializePaint();
    }
  }
  pushPaints(recorder, paints);
  if (node.type === NodeType.Layer) {
    recorder.saveLayer();
  }
  const ctm = getCTMForNode(node);
  const shouldRestore = !!ctm || node.type === NodeType.Layer;
  if (ctm) {
    recorder.saveCTM(ctm);
  }
  const nodeType = node.type;
  // Handle special cases first
  if (nodeType === NodeType.Box) {
    // Optimized shadow collection - avoid filter().map() chain
    const children = node.children;
    const childLen = children.length;
    const shadows: { props: BoxShadowProps }[] = [];
    for (let i = 0; i < childLen; i++) {
      const child = children[i];
      if (child.type === NodeType.BoxShadow) {
        shadows.push({ props: child.props as BoxShadowProps });
      }
    }
    recorder.drawBox(props, shadows);
  } else if (nodeType === NodeType.Fill) {
    recorder.drawPaint();
  } else if (nodeType === NodeType.Image) {
    recorder.drawImage(props);
  } else if (nodeType === NodeType.Circle) {
    recorder.drawCircle(props);
  } else if (nodeType === NodeType.Points) {
    recorder.drawPoints(props);
  } else if (nodeType === NodeType.Path) {
    recorder.drawPath(props);
  } else if (nodeType === NodeType.Rect) {
    recorder.drawRect(props);
  } else if (nodeType === NodeType.RRect) {
    recorder.drawRRect(props);
  } else if (nodeType === NodeType.Oval) {
    recorder.drawOval(props);
  } else if (nodeType === NodeType.Line) {
    recorder.drawLine(props);
  } else if (nodeType === NodeType.Patch) {
    recorder.drawPatch(props);
  } else if (nodeType === NodeType.Vertices) {
    recorder.drawVertices(props);
  } else if (nodeType === NodeType.DiffRect) {
    recorder.drawDiffRect(props);
  } else if (nodeType === NodeType.Text) {
    recorder.drawText(props);
  } else if (nodeType === NodeType.TextPath) {
    recorder.drawTextPath(props);
  } else if (nodeType === NodeType.TextBlob) {
    recorder.drawTextBlob(props);
  } else if (nodeType === NodeType.Glyphs) {
    recorder.drawGlyphs(props);
  } else if (nodeType === NodeType.Picture) {
    recorder.drawPicture(props);
  } else if (nodeType === NodeType.ImageSVG) {
    recorder.drawImageSVG(props);
  } else if (nodeType === NodeType.Paragraph) {
    recorder.drawParagraph(props);
  } else if (nodeType === NodeType.Skottie) {
    recorder.drawSkottie(props);
  } else if (nodeType === NodeType.Atlas) {
    recorder.drawAtlas(props);
  }
  const drawingsLen = drawings.length;
  for (let i = 0; i < drawingsLen; i++) {
    visitNode(recorder, drawings[i]);
  }
  if (shouldPushPaint) {
    recorder.restorePaint();
  }
  if (shouldRestore) {
    recorder.restoreCTM();
  }
  recorder.restoreGroup();
};

export const visit = (recorder: BaseRecorder, root: Node[]) => {
  const len = root.length;
  for (let i = 0; i < len; i++) {
    visitNode(recorder, root[i]);
  }
};
