import { Skia } from "../Skia";
import { useRawData } from "./Data";
const animatedImgFactory = Skia.AnimatedImage.MakeAnimatedImageFromEncoded.bind(Skia.AnimatedImage);

/**
 * Returns a Skia Animated Image object
 * */
export const useAnimatedImage = (source, onError) => useRawData(source, animatedImgFactory, onError);
//# sourceMappingURL=AnimatedImage.js.map