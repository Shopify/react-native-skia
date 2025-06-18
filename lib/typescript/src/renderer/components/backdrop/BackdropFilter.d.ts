import type { ReactNode } from "react";
import React from "react";
import type { GroupProps } from "../../../dom/types";
import type { SkiaProps } from "../../processors/Animations/Animations";
export interface BackdropFilterProps extends GroupProps {
    filter: ReactNode | ReactNode[];
}
export declare const BackdropFilter: ({ filter, children: groupChildren, ...props }: SkiaProps<BackdropFilterProps, "filter">) => React.JSX.Element;
