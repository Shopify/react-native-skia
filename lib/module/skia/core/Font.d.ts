import type { DataModule, DataSourceParam, SkFontMgr } from "../types";
import type { SkTypefaceFontProvider } from "../types/Paragraph/TypefaceFontProvider";
/**
 * Returns a Skia Font object
 * */
export declare const useFont: (font: DataSourceParam, size?: number, onError?: (err: Error) => void) => import("../types").SkFont | null;
type Slant = "normal" | "italic" | "oblique";
type Weight = "normal" | "bold" | "100" | "200" | "300" | "400" | "500" | "600" | "700" | "800" | "900";
interface RNFontStyle {
    fontFamily: string;
    fontSize: number;
    fontStyle: Slant;
    fontWeight: Weight;
}
export declare const matchFont: (inputStyle?: Partial<RNFontStyle>, fontMgr?: SkFontMgr) => import("../types").SkFont;
export declare const listFontFamilies: (fontMgr?: SkFontMgr) => string[];
export declare const useFonts: (sources: Record<string, DataModule[]>) => SkTypefaceFontProvider | null;
export {};
