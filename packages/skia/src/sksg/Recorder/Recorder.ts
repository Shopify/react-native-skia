import type { SharedValue } from "react-native-reanimated";

import type {
  NodeType,
  BlurMaskFilterProps,
  CircleProps,
  CTMProps,
  ImageProps,
  PaintProps,
  PointsProps,
  PathProps,
  RectProps,
  RoundedRectProps,
  OvalProps,
  LineProps,
  PatchProps,
  VerticesProps,
  DiffRectProps,
  TextProps,
  TextPathProps,
  TextBlobProps,
  GlyphsProps,
  PictureProps,
  ImageSVGProps,
  ParagraphProps,
  AtlasProps,
} from "../../dom/types";
import type { AnimatedProps } from "../../renderer";
import { isSharedValue } from "../nodes/utils";

import { CommandType } from "./Core";
import type { Command } from "./Core";

export class Recorder {
  commands: Command[] = [];

  private add(command: Command) {
    if (command.props) {
      const props = command.props as Record<string, unknown>;
      const animatedProps: Record<string, SharedValue<unknown>> = {};
      let hasAnimatedProps = false;
      for (const key in command.props) {
        const prop = props[key];
        if (isSharedValue(prop)) {
          props[key] = prop.value;
          animatedProps[key] = prop;
          hasAnimatedProps = true;
        }
      }
      if (hasAnimatedProps) {
        command.animatedProps = animatedProps;
      }
    }
    this.commands.push(command);
  }

  savePaint(props: AnimatedProps<PaintProps>) {
    this.add({ type: CommandType.SavePaint, props });
  }

  restorePaint() {
    this.add({ type: CommandType.RestorePaint });
  }

  materializePaint() {
    this.add({ type: CommandType.MaterializePaint });
  }

  pushColorFilter(colorFilterType: NodeType, props: AnimatedProps<unknown>) {
    this.add({
      type: CommandType.PushColorFilter,
      colorFilterType,
      props,
    });
  }

  pushBlurMaskFilter(props: AnimatedProps<BlurMaskFilterProps>) {
    this.add({ type: CommandType.PushBlurMaskFilter, props });
  }

  composeColorFilters() {
    this.add({ type: CommandType.ComposeColorFilter });
  }

  saveCTM(props: AnimatedProps<CTMProps>) {
    this.add({ type: CommandType.SaveCTM, props });
  }

  restoreCTM() {
    this.add({ type: CommandType.RestoreCTM });
  }

  drawPaint() {
    this.add({ type: CommandType.DrawPaint });
  }

  drawImage(props: AnimatedProps<ImageProps>) {
    this.add({ type: CommandType.DrawImage, props });
  }

  drawCircle(props: AnimatedProps<CircleProps>) {
    this.add({ type: CommandType.DrawCircle, props });
  }
  drawPoints(props: AnimatedProps<PointsProps>) {
    this.add({ type: CommandType.DrawPoints, props });
  }

  drawPath(props: AnimatedProps<PathProps>) {
    this.add({ type: CommandType.DrawPath, props });
  }

  drawRect(props: AnimatedProps<RectProps>) {
    this.add({ type: CommandType.DrawRect, props });
  }

  drawRRect(props: AnimatedProps<RoundedRectProps>) {
    this.add({ type: CommandType.DrawRRect, props });
  }

  drawOval(props: AnimatedProps<OvalProps>) {
    this.add({ type: CommandType.DrawOval, props });
  }

  drawLine(props: AnimatedProps<LineProps>) {
    this.add({ type: CommandType.DrawLine, props });
  }

  drawPatch(props: AnimatedProps<PatchProps>) {
    this.add({ type: CommandType.DrawPatch, props });
  }

  drawVertices(props: AnimatedProps<VerticesProps>) {
    this.add({ type: CommandType.DrawVertices, props });
  }

  drawDiffRect(props: AnimatedProps<DiffRectProps>) {
    this.add({ type: CommandType.DrawDiffRect, props });
  }

  drawText(props: AnimatedProps<TextProps>) {
    this.add({ type: CommandType.DrawText, props });
  }

  drawTextPath(props: AnimatedProps<TextPathProps>) {
    this.add({ type: CommandType.DrawTextPath, props });
  }

  drawTextBlob(props: AnimatedProps<TextBlobProps>) {
    this.add({ type: CommandType.DrawTextBlob, props });
  }

  drawGlyphs(props: AnimatedProps<GlyphsProps>) {
    this.add({ type: CommandType.DrawGlyphs, props });
  }

  drawPicture(props: AnimatedProps<PictureProps>) {
    this.add({ type: CommandType.DrawPicture, props });
  }

  drawImageSVG(props: AnimatedProps<ImageSVGProps>) {
    this.add({ type: CommandType.DrawImageSVG, props });
  }

  drawParagraph(props: AnimatedProps<ParagraphProps>) {
    this.add({ type: CommandType.DrawParagraph, props });
  }

  drawAtlas(props: AnimatedProps<AtlasProps>) {
    this.add({ type: CommandType.DrawAtlas, props });
  }
}
