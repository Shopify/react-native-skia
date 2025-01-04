import type { SharedValue } from "react-native-reanimated";

import type {
  CTMProps,
  ImageProps,
  NodeType,
  PaintProps,
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

  composeColorFilters() {
    this.add({ type: CommandType.ComposeColorFilter });
  }

  saveCTM(props: AnimatedProps<CTMProps>) {
    this.add({ type: CommandType.SaveCTM, props });
  }

  restoreCTM() {
    this.add({ type: CommandType.RestoreCTM });
  }

  drawImage(props: AnimatedProps<ImageProps>) {
    this.add({ type: CommandType.DrawImage, props });
  }
}
