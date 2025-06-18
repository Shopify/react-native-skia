export namespace Platform {
    export let OS: string;
    export let PixelRatio: number;
    export function resolveAsset(source: any): any;
    export function findNodeHandle(): never;
    export { View };
}
declare function View({ children, onLayout, style: rawStyle }: {
    children: any;
    onLayout: any;
    style: any;
}): React.DetailedReactHTMLElement<{
    ref: React.MutableRefObject<null>;
    style: any;
}, HTMLElement>;
import React from "react";
export {};
