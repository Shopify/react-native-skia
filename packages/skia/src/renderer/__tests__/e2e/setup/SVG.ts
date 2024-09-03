// Because SkSVG doesn't exist on web,

import type { SkSVG } from "../../../../skia/types";

// this instance is just to send the svg over the wire
export class SVGAsset implements SkSVG {
  __typename__ = "SVG" as const;
  constructor(
    private _source: string,
    private _width: number,
    private _height: number
  ) {}

  dispose() {}

  source() {
    return this._source;
  }

  width() {
    return this._width;
  }

  height() {
    return this._height;
  }
}
