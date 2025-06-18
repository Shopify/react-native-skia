import type { Command } from "../Core";
import { CommandType } from "../Core";
import type { DrawingContext } from "../DrawingContext";
export declare const isPushShader: (command: Command) => command is Command<CommandType.PushShader>;
export declare const pushShader: (ctx: DrawingContext, command: Command<CommandType.PushShader>) => void;
