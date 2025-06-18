import type { SkSVG } from "../../../../skia/types";
export declare class SVGAsset implements SkSVG {
    private _source;
    private _width;
    private _height;
    __typename__: "SVG";
    constructor(_source: string, _width: number, _height: number);
    dispose(): void;
    source(): string;
    width(): number;
    height(): number;
}
