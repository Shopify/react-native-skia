import { Skia } from "../Skia";
import { useRawData } from "./Data";
const tfFactory = Skia.Typeface.MakeFreeTypeFaceFromData.bind(Skia.Typeface);

/**
 * Returns a Skia Typeface object
 * */
export const useTypeface = (source, onError) => useRawData(source, tfFactory, onError);
//# sourceMappingURL=Typeface.js.map