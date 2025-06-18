import type { SkJSIInstance } from "../JsiInstance";
import type { SkImage } from "../Image";
export interface SkAnimatedImage extends SkJSIInstance<"AnimatedImage"> {
    /**
     *  Decode the next frame.
     *
     *  If the animation is on the last frame or has hit an error, returns
     *  kFinished (-1).
     */
    decodeNextFrame(): number;
    /**
     *  Returns the current frame as an SkImage. The SkImage will not change
     *  after it has been returned.
     *  If there is no current frame, null will be returned.
     */
    getCurrentFrame(): SkImage | null;
    /**
     *  How long to display the current frame.
     *
     *  Useful for the first frame, for which decodeNextFrame is called
     *  internally.
     */
    currentFrameDuration(): number;
    /**
     *  Returns the number of frames in the animation.
     *
     */
    getFrameCount(): number;
}
