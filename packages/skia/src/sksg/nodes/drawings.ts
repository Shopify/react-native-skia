import { enumKey, processCircle } from "../../dom/nodes";
import type {
  AtlasProps,
  CircleProps,
  DrawingNodeProps,
  ImageSVGProps,
  ParagraphProps,
  PictureProps,
} from "../../dom/types";
import { BlendMode } from "../../skia/types";
import type { DrawingContext } from "../DrawingContext";

export const drawImageSVG = (ctx: DrawingContext, props: ImageSVGProps) => {
  "worklet";
  const { canvas } = ctx;
  const { svg } = props;
  const { x, y, width, height } = props.rect
    ? props.rect
    : { x: props.x, y: props.y, width: props.width, height: props.height };
  if (svg === null) {
    return;
  }
  canvas.save();
  if (x && y) {
    canvas.translate(x, y);
  }
  canvas.drawSvg(svg, width, height);
  canvas.restore();
};

export const drawParagraph = (ctx: DrawingContext, props: ParagraphProps) => {
  "worklet";
  const { paragraph, x, y, width } = props;
  if (paragraph) {
    paragraph.layout(width);
    paragraph.paint(ctx.canvas, x, y);
  }
};

export const drawPicture = (ctx: DrawingContext, props: PictureProps) => {
  "worklet";
  const { picture } = props;
  ctx.canvas.drawPicture(picture);
};

export const drawAtlas = (ctx: DrawingContext, props: AtlasProps) => {
  "worklet";
  const { image, sprites, transforms, colors, blendMode } = props;
  const blend = blendMode ? BlendMode[enumKey(blendMode)] : undefined;
  if (image) {
    ctx.canvas.drawAtlas(image, sprites, transforms, ctx.paint, blend, colors);
  }
};

export const drawCircle = (ctx: DrawingContext, props: CircleProps) => {
  "worklet";
  const { c } = processCircle(props);
  const { r } = props;
  ctx.canvas.drawCircle(c.x, c.y, r, ctx.paint);
};

export const drawFill = (ctx: DrawingContext, _props: DrawingNodeProps) => {
  "worklet";
  ctx.canvas.drawPaint(ctx.paint);
};
