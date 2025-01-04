import type { SharedValue } from "react-native-reanimated";

import type { CircleProps, ImageProps } from "../../dom/types";

// TODO: remove string labels
export enum CommandType {
  // Context
  SavePaint = "SavePaint",
  RestorePaint = "RestorePaint",
  SaveCTM = "SaveCTM",
  RestoreCTM = "RestoreCTM",
  PushColorFilter = "PushColorFilter",
  ComposeColorFilter = "ComposeColorFilter",
  MaterializePaint = "MaterializePaint",
  // Drawing
  DrawImage = "DrawImage",
  DrawCircle = "DrawCircle",
}

export type Command<T extends CommandType = CommandType> = {
  type: T;
  [key: string]: unknown;
};

export const materializeProps = (command: Command) => {
  if (command.animatedProps) {
    const animatedProps = command.animatedProps as Record<
      string,
      SharedValue<unknown>
    >;
    const commandProps = command.props as Record<string, unknown>;
    for (const key in animatedProps) {
      commandProps[key] = animatedProps[key].value;
    }
  }
};

export const isCommand = <T extends CommandType>(
  command: Command,
  type: T
): command is Command<T> => {
  return command.type === type;
};

interface Props {
  [CommandType.DrawImage]: ImageProps;
  [CommandType.DrawCircle]: CircleProps;
}

interface DrawCommand<T extends CommandType> extends Command<T> {
  props: T extends keyof Props ? Props[T] : never;
}

export const isDrawCommand = <T extends keyof Props>(
  command: Command,
  type: T
): command is DrawCommand<T> => {
  return command.type === type;
};
