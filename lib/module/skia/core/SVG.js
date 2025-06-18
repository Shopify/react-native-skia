import { Skia } from "../Skia";
import { useRawData } from "./Data";
const svgFactory = Skia.SVG.MakeFromData.bind(Skia.SVG);
export const useSVG = (source, onError) => useRawData(source, svgFactory, onError);
//# sourceMappingURL=SVG.js.map