"worklet";

import { enumKey, processRadius } from "../../../dom/nodes";
import type {
  BlendImageFilterProps,
  BlurImageFilterProps,
  BlurMaskFilterProps,
  DisplacementMapImageFilterProps,
  DropShadowImageFilterProps,
  MorphologyImageFilterProps,
  OffsetImageFilterProps,
  RuntimeShaderImageFilterProps,
} from "../../../dom/types";
import { NodeType } from "../../../dom/types";
import { BlurStyle, TileMode } from "../../../skia/types";
import type { Command } from "../Core";
import { CommandType } from "../Core";
import type { DrawingContext } from "../DrawingContext";

export enum MorphologyOperator {
  Erode,
  Dilate,
}

const declareBlurImageFilter = (
  ctx: DrawingContext,
  props: BlurImageFilterProps
) => {
  "worklet";
  const { mode, blur } = props;
  const sigma = processRadius(ctx.Skia, blur);
  const imgf = ctx.Skia.ImageFilter.MakeBlur(
    sigma.x,
    sigma.y,
    TileMode[enumKey(mode)],
    null
  );
  ctx.imageFilters.push(imgf);
};

const declareMorphologyImageFilter = (
  ctx: DrawingContext,
  props: MorphologyImageFilterProps
) => {
  "worklet";
  const { operator } = props;
  const r = processRadius(ctx.Skia, props.radius);
  let imgf;
  if (MorphologyOperator[enumKey(operator)] === MorphologyOperator.Erode) {
    imgf = ctx.Skia.ImageFilter.MakeErode(r.x, r.y, null);
  } else {
    imgf = ctx.Skia.ImageFilter.MakeDilate(r.x, r.y, null);
  }
  return imgf;
};

export const composeImageFilters = (ctx: DrawingContext) => {
  if (ctx.imageFilters.length > 1) {
    const outer = ctx.imageFilters.pop()!;
    const inner = ctx.imageFilters.pop()!;
    ctx.imageFilters.push(ctx.Skia.ImageFilter.MakeCompose(outer, inner));
  }
};

export const setBlurMaskFilter = (
  ctx: DrawingContext,
  props: BlurMaskFilterProps
) => {
  "worklet";
  const { blur, style, respectCTM } = props;
  const mf = ctx.Skia.MaskFilter.MakeBlur(
    BlurStyle[enumKey(style)],
    blur,
    respectCTM
  );
  ctx.paint.setMaskFilter(mf);
};

export const isPushImageFilter = (
  command: Command
): command is Command<CommandType.PushImageFilter> => {
  return command.type === CommandType.PushImageFilter;
};

type Props = {
  [NodeType.OffsetImageFilter]: OffsetImageFilterProps;
  [NodeType.DisplacementMapImageFilter]: DisplacementMapImageFilterProps;
  [NodeType.BlurImageFilter]: BlurImageFilterProps;
  [NodeType.DropShadowImageFilter]: DropShadowImageFilterProps;
  [NodeType.MorphologyImageFilter]: MorphologyImageFilterProps;
  [NodeType.BlendImageFilter]: BlendImageFilterProps;
  [NodeType.RuntimeShaderImageFilter]: RuntimeShaderImageFilterProps;
};

interface PushImageFilter<T extends keyof Props>
  extends Command<CommandType.PushImageFilter> {
  imageFilterType: T;
  props: Props[T];
}

export const setImageFilters = (ctx: DrawingContext) => {
  if (ctx.imageFilters.length > 0) {
    ctx.paint.setImageFilter(
      ctx.imageFilters.reduceRight((inner, outer) =>
        inner ? ctx.Skia.ImageFilter.MakeCompose(outer, inner) : outer
      )
    );
  }
};

const isImageFilter = <T extends keyof Props>(
  command: Command<CommandType.PushImageFilter>,
  type: T
): command is PushImageFilter<T> => {
  return command.imageFilterType === type;
};

export const pushImageFilter = (
  ctx: DrawingContext,
  command: Command<CommandType.PushImageFilter>
) => {
  if (isImageFilter(command, NodeType.BlurImageFilter)) {
    declareBlurImageFilter(ctx, command.props);
  } else if (isImageFilter(command, NodeType.MorphologyImageFilter)) {
    declareMorphologyImageFilter(ctx, command.props);
  }
};
