import React from "react";
import type { AnimatedProps } from "../../processors";
import type { Radius } from "../../../dom/types";
import type { BackdropFilterProps } from "./BackdropFilter";
interface BackdropBlurProps extends Omit<BackdropFilterProps, "filter"> {
    blur: Radius;
}
export declare const BackdropBlur: ({ blur, children, ...props }: AnimatedProps<BackdropBlurProps>) => React.JSX.Element;
export {};
