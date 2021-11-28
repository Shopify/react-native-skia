import type { IImage } from "../../../skia";
import { useImage, Skia } from "../../../skia";
import { exhaustiveCheck } from "../../typeddash";
import type { CustomPaintProps } from "../../processors/Paint";
import { useDrawing } from "../../nodes/Drawing";
import type { RectDef } from "../../processors/Shapes";
import { processRect } from "../../processors/Shapes";
import type { AnimatedProps } from "../../processors/Animations/Animations";
import { materialize } from "../../processors/Animations/Animations";

// https://api.flutter.dev/flutter/painting/BoxFit-class.html
export type Fit =
  | "cover"
  | "contain"
  | "fill"
  | "fitHeight"
  | "fitWidth"
  | "none"
  | "scaleDown";

export type ImageProps = RectDef &
  CustomPaintProps & {
    source: number | IImage;
    fit: Fit;
  };

export const Image = (props: AnimatedProps<ImageProps, "source">) => {
  const image = useImage(props.source);
  const onDraw = useDrawing(
    (ctx) => {
      if (image === null) {
        return;
      }
      const { canvas, paint } = ctx;
      const { fit, ...rectProps } = materialize(ctx, props);
      const { x, y, width, height } = processRect(rectProps);
      const sizes = applyBoxFit(
        fit,
        { width: image.width(), height: image.height() },
        { width, height }
      );
      const inputSubrect = inscribe(sizes.source, {
        x: 0,
        y: 0,
        width: image.width(),
        height: image.height(),
      });
      const outputSubrect = inscribe(sizes.destination, {
        x,
        y,
        width,
        height,
      });
      canvas.drawImageRect(image, inputSubrect, outputSubrect, paint);
    },
    [image, props]
  );
  return <skDrawing onDraw={onDraw} {...props} />;
};

Image.defaultProps = {
  x: 0,
  y: 0,
  fit: "contain",
};

interface Size {
  width: number;
  height: number;
}

const size = (width = 0, height = 0) => ({ width, height });

const inscribe = (
  { width, height }: Size,
  rect: { x: number; y: number; width: number; height: number }
) => {
  const halfWidthDelta = (rect.width - width) / 2.0;
  const halfHeightDelta = (rect.height - height) / 2.0;
  return Skia.XYWHRect(
    rect.x + halfWidthDelta,
    rect.y + halfHeightDelta,
    width,
    height
  );
};

const applyBoxFit = (fit: Fit, inputSize: Size, outputSize: Size) => {
  let source = size(),
    destination = size();
  if (
    inputSize.height <= 0.0 ||
    inputSize.width <= 0.0 ||
    outputSize.height <= 0.0 ||
    outputSize.width <= 0.0
  ) {
    return { source, destination };
  }
  switch (fit) {
    case "fill":
      source = inputSize;
      destination = outputSize;
      break;
    case "contain":
      source = inputSize;
      if (outputSize.width / outputSize.height > source.width / source.height) {
        destination = size(
          (source.width * outputSize.height) / source.height,
          outputSize.height
        );
      } else {
        destination = size(
          outputSize.width,
          (source.height * outputSize.width) / source.width
        );
      }
      break;
    case "cover":
      if (
        outputSize.width / outputSize.height >
        inputSize.width / inputSize.height
      ) {
        source = size(
          inputSize.width,
          (inputSize.width * outputSize.height) / outputSize.width
        );
      } else {
        source = size(
          (inputSize.height * outputSize.width) / outputSize.height,
          inputSize.height
        );
      }
      destination = outputSize;
      break;
    case "fitWidth":
      source = size(
        inputSize.width,
        (inputSize.width * outputSize.height) / outputSize.width
      );
      destination = size(
        outputSize.width,
        (source.height * outputSize.width) / source.width
      );
      break;
    case "fitHeight":
      source = size(
        (inputSize.height * outputSize.width) / outputSize.height,
        inputSize.height
      );
      destination = size(
        (source.width * outputSize.height) / source.height,
        outputSize.height
      );
      break;
    case "none":
      source = size(
        Math.min(inputSize.width, outputSize.width),
        Math.min(inputSize.height, outputSize.height)
      );
      destination = source;
      break;
    case "scaleDown":
      source = inputSize;
      destination = inputSize;
      const aspectRatio = inputSize.width / inputSize.height;
      if (destination.height > outputSize.height) {
        destination = size(outputSize.height * aspectRatio, outputSize.height);
      }
      if (destination.width > outputSize.width) {
        destination = size(outputSize.width, outputSize.width / aspectRatio);
      }
      break;
    default:
      exhaustiveCheck(fit);
  }
  return { source, destination };
};
