import type { Command } from "../Core";
import { CommandType } from "../Core";
import type { DrawingContext } from "../DrawingContext";
export declare const isPushPathEffect: (command: Command) => command is Command<CommandType.PushPathEffect>;
export declare const composePathEffects: (ctx: DrawingContext) => void;
export declare const pushPathEffect: (ctx: DrawingContext, command: Command<CommandType.PushPathEffect>) => void;
