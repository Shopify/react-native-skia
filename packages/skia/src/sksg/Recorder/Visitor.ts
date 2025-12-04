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

export const processPaint = ({
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
}: DrawingNodeProps) => {
  // Check if any paint property exists before allocating object
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
  if (opacity !== undefined) {
    paint.opacity = opacity;
  }
  if (color !== undefined) {
    paint.color = color;
  }
  if (strokeWidth !== undefined) {
    paint.strokeWidth = strokeWidth;
  }
  if (blendMode !== undefined) {
    paint.blendMode = blendMode;
  }
  if (style !== undefined) {
    paint.style = style;
  }
  if (strokeJoin !== undefined) {
    paint.strokeJoin = strokeJoin;
  }
  if (strokeCap !== undefined) {
    paint.strokeCap = strokeCap;
  }
  if (strokeMiter !== undefined) {
    paint.strokeMiter = strokeMiter;
  }
  if (antiAlias !== undefined) {
    paint.antiAlias = antiAlias;
  }
  if (dither !== undefined) {
    paint.dither = dither;
  }
  if (paintRef !== undefined) {
    paint.paint = paintRef;
  }

  return paint;
};

const processCTM = ({
  clip,
  invertClip,
  transform,
  origin,
  matrix,
  layer,
}: CTMProps) => {
  // Check if any CTM property exists before allocating object
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
  if (clip !== undefined) {
    ctm.clip = clip;
  }
  if (invertClip !== undefined) {
    ctm.invertClip = invertClip;
  }
  if (transform !== undefined) {
    ctm.transform = transform;
  }
  if (origin !== undefined) {
    ctm.origin = origin;
  }
  if (matrix !== undefined) {
    ctm.matrix = matrix;
  }
  if (layer !== undefined) {
    ctm.layer = layer;
  }
  return ctm;
};

const pushColorFilters = (
  recorder: BaseRecorder,
  colorFilters: Node<any>[]
) => {
  const len = colorFilters.length;
  for (let i = 0; i < len; i++) {
    const colorFilter = colorFilters[i];
    if (colorFilter.children.length > 0) {
      pushColorFilters(recorder, colorFilter.children);
    }
    recorder.pushColorFilter(colorFilter.type, colorFilter.props);
    if (
      colorFilter.type !== NodeType.LerpColorFilter &&
      colorFilter.children.length > 0
    ) {
      recorder.composeColorFilter();
    }
  }
};

const pushPathEffects = (recorder: BaseRecorder, pathEffects: Node<any>[]) => {
  const len = pathEffects.length;
  for (let i = 0; i < len; i++) {
    const pathEffect = pathEffects[i];
    if (pathEffect.children.length > 0) {
      pushPathEffects(recorder, pathEffect.children);
    }
    recorder.pushPathEffect(pathEffect.type, pathEffect.props);
    if (
      pathEffect.type !== NodeType.SumPathEffect &&
      pathEffect.children.length > 0
    ) {
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
    if (imageFilter.children.length > 0) {
      pushImageFilters(recorder, imageFilter.children);
    }
    if (isImageFilter(imageFilter.type)) {
      recorder.pushImageFilter(imageFilter.type, imageFilter.props);
    } else if (isShader(imageFilter.type)) {
      recorder.pushShader(imageFilter.type, imageFilter.props, 0);
    }
    if (
      imageFilter.type !== NodeType.BlendImageFilter &&
      imageFilter.children.length > 0
    ) {
      recorder.composeImageFilter();
    }
  }
};

const pushShaders = (recorder: BaseRecorder, shaders: Node<any>[]) => {
  const len = shaders.length;
  for (let i = 0; i < len; i++) {
    const shader = shaders[i];
    if (shader.children.length > 0) {
      pushShaders(recorder, shader.children);
    }
    recorder.pushShader(shader.type, shader.props, shader.children.length);
  }
};

const pushMaskFilters = (recorder: BaseRecorder, maskFilters: Node<any>[]) => {
  const len = maskFilters.length;
  if (len > 0) {
    recorder.pushBlurMaskFilter(maskFilters[len - 1].props);
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

// Reusable empty object for stacking context
const EMPTY_STACKING_CONTEXT = undefined;

const visitNode = (recorder: BaseRecorder, node: Node<any>) => {
  const { props, type } = node;

  // Get zIndex directly instead of creating wrapper object
  const zIndex = (props as DrawingNodeProps).zIndex;
  recorder.saveGroup(zIndex !== undefined ? { zIndex } : EMPTY_STACKING_CONTEXT);

  const {
    colorFilters,
    maskFilters,
    drawings,
    shaders,
    imageFilters,
    pathEffects,
    paints,
  } = sortNodeChildren(node);

  const paint = processPaint(props);
  const hasDeclarations =
    colorFilters.length > 0 ||
    maskFilters.length > 0 ||
    imageFilters.length > 0 ||
    pathEffects.length > 0 ||
    shaders.length > 0;
  const shouldPushPaint = paint !== null || hasDeclarations;

  if (shouldPushPaint) {
    recorder.savePaint(paint ?? {}, false);
    pushColorFilters(recorder, colorFilters);
    pushImageFilters(recorder, imageFilters);
    pushMaskFilters(recorder, maskFilters);
    pushShaders(recorder, shaders);
    pushPathEffects(recorder, pathEffects);
    // For mixed nodes like BackdropFilters we don't materialize the paint
    if (type === NodeType.BackdropFilter) {
      recorder.saveBackdropFilter();
    } else {
      recorder.materializePaint();
    }
  }

  if (paints.length > 0) {
    pushPaints(recorder, paints);
  }

  if (type === NodeType.Layer) {
    recorder.saveLayer();
  }

  const ctm = processCTM(props);
  const shouldRestore = ctm !== null || type === NodeType.Layer;
  if (ctm !== null) {
    recorder.saveCTM(ctm);
  }

  // Draw based on node type
  switch (type) {
    case NodeType.Box:
      // Filter BoxShadow children inline
      const children = node.children;
      const childLen = children.length;
      let shadows: { props: BoxShadowProps }[] | null = null;
      for (let i = 0; i < childLen; i++) {
        const child = children[i];
        if (child.type === NodeType.BoxShadow) {
          if (shadows === null) {
            shadows = [];
          }
          shadows.push({ props: child.props as BoxShadowProps });
        }
      }
      recorder.drawBox(props, shadows ?? []);
      break;
    case NodeType.Fill:
      recorder.drawPaint();
      break;
    case NodeType.Image:
      recorder.drawImage(props);
      break;
    case NodeType.Circle:
      recorder.drawCircle(props);
      break;
    case NodeType.Points:
      recorder.drawPoints(props);
      break;
    case NodeType.Path:
      recorder.drawPath(props);
      break;
    case NodeType.Rect:
      recorder.drawRect(props);
      break;
    case NodeType.RRect:
      recorder.drawRRect(props);
      break;
    case NodeType.Oval:
      recorder.drawOval(props);
      break;
    case NodeType.Line:
      recorder.drawLine(props);
      break;
    case NodeType.Patch:
      recorder.drawPatch(props);
      break;
    case NodeType.Vertices:
      recorder.drawVertices(props);
      break;
    case NodeType.DiffRect:
      recorder.drawDiffRect(props);
      break;
    case NodeType.Text:
      recorder.drawText(props);
      break;
    case NodeType.TextPath:
      recorder.drawTextPath(props);
      break;
    case NodeType.TextBlob:
      recorder.drawTextBlob(props);
      break;
    case NodeType.Glyphs:
      recorder.drawGlyphs(props);
      break;
    case NodeType.Picture:
      recorder.drawPicture(props);
      break;
    case NodeType.ImageSVG:
      recorder.drawImageSVG(props);
      break;
    case NodeType.Paragraph:
      recorder.drawParagraph(props);
      break;
    case NodeType.Skottie:
      recorder.drawSkottie(props);
      break;
    case NodeType.Atlas:
      recorder.drawAtlas(props);
      break;
  }

  // Visit child drawings
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
