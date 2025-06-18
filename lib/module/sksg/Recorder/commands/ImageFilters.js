import { enumKey, processColor, processRadius } from "../../../dom/nodes";
import { NodeType } from "../../../dom/types";
import { BlendMode, BlurStyle, ColorChannel, processUniforms, TileMode } from "../../../skia/types";
import { composeDeclarations } from "../../utils";
import { CommandType } from "../Core";
export let MorphologyOperator = /*#__PURE__*/function (MorphologyOperator) {
  MorphologyOperator[MorphologyOperator["Erode"] = 0] = "Erode";
  MorphologyOperator[MorphologyOperator["Dilate"] = 1] = "Dilate";
  return MorphologyOperator;
}({});
const Black = Float32Array.of(0, 0, 0, 1);
const MakeInnerShadow = (Skia, shadowOnly, dx, dy, sigmaX, sigmaY, color, input) => {
  "worklet";

  const sourceGraphic = Skia.ImageFilter.MakeColorFilter(Skia.ColorFilter.MakeBlend(Black, BlendMode.Dst), null);
  const sourceAlpha = Skia.ImageFilter.MakeColorFilter(Skia.ColorFilter.MakeBlend(Black, BlendMode.SrcIn), null);
  const f1 = Skia.ImageFilter.MakeColorFilter(Skia.ColorFilter.MakeBlend(color, BlendMode.SrcOut), null);
  const f2 = Skia.ImageFilter.MakeOffset(dx, dy, f1);
  const f3 = Skia.ImageFilter.MakeBlur(sigmaX, sigmaY, TileMode.Decal, f2);
  const f4 = Skia.ImageFilter.MakeBlend(BlendMode.SrcIn, sourceAlpha, f3);
  if (shadowOnly) {
    return f4;
  }
  return Skia.ImageFilter.MakeCompose(input, Skia.ImageFilter.MakeBlend(BlendMode.SrcOver, sourceGraphic, f4));
};
const declareBlurImageFilter = (ctx, props) => {
  "worklet";

  const {
    mode,
    blur
  } = props;
  const sigma = processRadius(ctx.Skia, blur);
  const imgf = ctx.Skia.ImageFilter.MakeBlur(sigma.x, sigma.y, TileMode[enumKey(mode)], null);
  ctx.imageFilters.push(imgf);
};
const declareMorphologyImageFilter = (ctx, props) => {
  "worklet";

  const {
    operator
  } = props;
  const r = processRadius(ctx.Skia, props.radius);
  let imgf;
  if (MorphologyOperator[enumKey(operator)] === MorphologyOperator.Erode) {
    imgf = ctx.Skia.ImageFilter.MakeErode(r.x, r.y, null);
  } else {
    imgf = ctx.Skia.ImageFilter.MakeDilate(r.x, r.y, null);
  }
  ctx.imageFilters.push(imgf);
};
const declareOffsetImageFilter = (ctx, props) => {
  "worklet";

  const {
    x,
    y
  } = props;
  const imgf = ctx.Skia.ImageFilter.MakeOffset(x, y, null);
  ctx.imageFilters.push(imgf);
};
const declareDropShadowImageFilter = (ctx, props) => {
  "worklet";

  const {
    dx,
    dy,
    blur,
    shadowOnly,
    color: cl,
    inner
  } = props;
  const color = processColor(ctx.Skia, cl);
  let factory;
  if (inner) {
    factory = MakeInnerShadow.bind(null, ctx.Skia, shadowOnly);
  } else {
    factory = shadowOnly ? ctx.Skia.ImageFilter.MakeDropShadowOnly.bind(ctx.Skia.ImageFilter) : ctx.Skia.ImageFilter.MakeDropShadow.bind(ctx.Skia.ImageFilter);
  }
  const imgf = factory(dx, dy, blur, blur, color, null);
  ctx.imageFilters.push(imgf);
};
const declareBlendImageFilter = (ctx, props) => {
  "worklet";

  const blend = BlendMode[enumKey(props.mode)];
  // Blend ImageFilters
  const imageFilters = ctx.imageFilters.splice(0, ctx.imageFilters.length);
  const composer = ctx.Skia.ImageFilter.MakeBlend.bind(ctx.Skia.ImageFilter, blend);
  ctx.imageFilters.push(composeDeclarations(imageFilters, composer));
};
const declareDisplacementMapImageFilter = (ctx, props) => {
  "worklet";

  const {
    channelX,
    channelY,
    scale
  } = props;
  const shader = ctx.shaders.pop();
  if (!shader) {
    throw new Error("DisplacementMap expects a shader as child");
  }
  const map = ctx.Skia.ImageFilter.MakeShader(shader, null);
  const imgf = ctx.Skia.ImageFilter.MakeDisplacementMap(ColorChannel[enumKey(channelX)], ColorChannel[enumKey(channelY)], scale, map, null);
  ctx.imageFilters.push(imgf);
};
const declareRuntimeShaderImageFilter = (ctx, props) => {
  "worklet";

  const {
    source,
    uniforms
  } = props;
  const rtb = ctx.Skia.RuntimeShaderBuilder(source);
  if (uniforms) {
    processUniforms(source, uniforms, rtb);
  }
  const imgf = ctx.Skia.ImageFilter.MakeRuntimeShader(rtb, null, null);
  ctx.imageFilters.push(imgf);
};
export const composeImageFilters = ctx => {
  "worklet";

  if (ctx.imageFilters.length > 1) {
    const outer = ctx.imageFilters.pop();
    const inner = ctx.imageFilters.pop();
    ctx.imageFilters.push(ctx.Skia.ImageFilter.MakeCompose(outer, inner));
  }
};
export const setBlurMaskFilter = (ctx, props) => {
  "worklet";

  const {
    blur,
    style,
    respectCTM
  } = props;
  const mf = ctx.Skia.MaskFilter.MakeBlur(BlurStyle[enumKey(style)], blur, respectCTM);
  ctx.paint.setMaskFilter(mf);
};
export const isPushImageFilter = command => {
  "worklet";

  return command.type === CommandType.PushImageFilter;
};
const isImageFilter = (command, type) => {
  "worklet";

  return command.imageFilterType === type;
};
export const pushImageFilter = (ctx, command) => {
  "worklet";

  if (isImageFilter(command, NodeType.BlurImageFilter)) {
    declareBlurImageFilter(ctx, command.props);
  } else if (isImageFilter(command, NodeType.MorphologyImageFilter)) {
    declareMorphologyImageFilter(ctx, command.props);
  } else if (isImageFilter(command, NodeType.BlendImageFilter)) {
    declareBlendImageFilter(ctx, command.props);
  } else if (isImageFilter(command, NodeType.DisplacementMapImageFilter)) {
    declareDisplacementMapImageFilter(ctx, command.props);
  } else if (isImageFilter(command, NodeType.DropShadowImageFilter)) {
    declareDropShadowImageFilter(ctx, command.props);
  } else if (isImageFilter(command, NodeType.OffsetImageFilter)) {
    declareOffsetImageFilter(ctx, command.props);
  } else if (isImageFilter(command, NodeType.RuntimeShaderImageFilter)) {
    declareRuntimeShaderImageFilter(ctx, command.props);
  } else {
    throw new Error("Invalid image filter type: " + command.imageFilterType);
  }
};
//# sourceMappingURL=ImageFilters.js.map