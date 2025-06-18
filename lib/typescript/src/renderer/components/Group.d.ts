import React from "react";
import type { SkiaProps } from "../processors";
import type { GroupProps } from "../../dom/types";
import type { ChildrenProps } from "../../dom/types/Common";
export interface PublicGroupProps extends Omit<GroupProps, "layer"> {
    layer?: GroupProps["layer"] | ChildrenProps["children"];
}
export declare const Group: ({ layer, ...props }: SkiaProps<PublicGroupProps>) => React.JSX.Element;
