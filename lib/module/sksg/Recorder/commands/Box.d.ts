import type { BoxProps, BoxShadowProps } from "../../../dom/types";
import type { Command } from "../Core";
import { CommandType } from "../Core";
import type { DrawingContext } from "../DrawingContext";
interface BoxCommand extends Command<CommandType.DrawBox> {
    props: BoxProps;
    shadows: {
        props: BoxShadowProps;
    }[];
}
export declare const isBoxCommand: (command: Command) => command is BoxCommand;
export declare const drawBox: (ctx: DrawingContext, command: BoxCommand) => void;
export {};
