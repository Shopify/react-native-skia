/*global SkiaApi*/
const resolveAssetSource = require("react-native/Libraries/Image/resolveAssetSource");

export interface ISvgStatic {
  fromLocalUri: (path: string) => Promise<ISvgDom>;
  fromString: (svgString: string) => ISvgDom;
}

export interface ISvgDom {
  readonly uri: string;
}

const SvgCtor = (req: number) => {
  const asset = resolveAssetSource(req);
  return SkiaApi.Svg.fromLocalUri(asset.uri);
};

export const SvgObject = {
  fromUri: (req: number): Promise<ISvgDom> => SvgCtor(req),
  fromText: (svgString: string): ISvgDom => SkiaApi.Svg.fromString(svgString),
};
