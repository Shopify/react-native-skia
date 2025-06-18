import type { BlurMaskFilterProps } from "../../../dom/types";
import type { Command } from "../Core";
import { CommandType } from "../Core";
import type { DrawingContext } from "../DrawingContext";
export declare enum MorphologyOperator {
    Erode = 0,
    Dilate = 1
}
export declare const composeImageFilters: (ctx: DrawingContext) => void;
export declare const setBlurMaskFilter: (ctx: DrawingContext, props: BlurMaskFilterProps) => void;
export declare const isPushImageFilter: (command: Command) => command is Command<CommandType.PushImageFilter>;
export declare const pushImageFilter: (ctx: DrawingContext, command: Command<CommandType.PushImageFilter>) => void;
