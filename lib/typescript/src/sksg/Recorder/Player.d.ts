import type { Command } from "./Core";
import type { DrawingContext } from "./DrawingContext";
export declare const replay: (ctx: DrawingContext, commands: Command[]) => void;
