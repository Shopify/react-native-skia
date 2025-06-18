import { CommandType } from "../Core";
import type { Command } from "../Core";
import type { DrawingContext } from "../DrawingContext";
export declare const isPushColorFilter: (command: Command) => command is Command<CommandType.PushColorFilter>;
export declare const composeColorFilters: (ctx: DrawingContext) => void;
export declare const pushColorFilter: (ctx: DrawingContext, command: Command<CommandType.PushColorFilter>) => void;
