import Rea from "../external/reanimated/ReanimatedProxy";
import type { Skia, SkPicture, JsiRecorder } from "../skia/types";
import { HAS_REANIMATED_3 } from "../external/reanimated/renderHelpers";

import { Container, StaticContainer } from "./StaticContainer";

import "../skia/NativeSetup";
import "../views/api";

const nativeDrawOnscreen = (
  nativeId: number,
  recorder: JsiRecorder,
  picture: SkPicture
) => {
  "worklet";

  //const start = performance.now();
  recorder.play(picture);
  //const end = performance.now();
  //console.log("Recording time: ", end - start);
  SkiaViewApi.setJsiProperty(nativeId, "picture", picture);
};

class NativeReanimatedContainer extends Container {
  private mapperId: number | null = null;
  private picture: SkPicture;

  constructor(
    Skia: Skia,
    private nativeId: number
  ) {
    super(Skia);
    this.picture = Skia.Picture.MakePicture(null)!;
  }

  redraw() {
    if (this.mapperId !== null) {
      Rea.stopMapper(this.mapperId);
    }
    if (this.unmounted) {
      return;
    }
    // Use native C++ visit for faster tree traversal
    const recorder = this.Skia.Recorder();
    const { nativeId, picture, Skia } = this;
    // Native visit returns the shared values it found
    const sharedValues = recorder.visit(this.root);
    // Draw first frame
    Rea.executeOnUIRuntimeSync(() => {
      "worklet";
      const firstPicture = Skia.Picture.MakePicture(null)!;
      nativeDrawOnscreen(nativeId, recorder, firstPicture);
    })();
    // Animate
    if (sharedValues.length > 0) {
      this.mapperId = Rea.startMapper(() => {
        "worklet";
        recorder.applyUpdates(sharedValues);
        nativeDrawOnscreen(nativeId, recorder, picture);
      }, sharedValues);
    }
  }
}

export const createContainer = (Skia: Skia, nativeId: number) => {
  if (HAS_REANIMATED_3 && nativeId !== -1) {
    return new NativeReanimatedContainer(Skia, nativeId);
  } else {
    return new StaticContainer(Skia, nativeId);
  }
};
