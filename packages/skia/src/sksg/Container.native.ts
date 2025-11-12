import Rea from "../external/reanimated/ReanimatedProxy";
import type { Skia, SkPicture } from "../skia/types";
import { HAS_REANIMATED_3 } from "../external/reanimated/renderHelpers";
import type { JsiRecorder } from "../skia/types/Recorder";

import { ReanimatedRecorder } from "./Recorder/ReanimatedRecorder";
import { Container, StaticContainer } from "./StaticContainer";
import { visit } from "./Recorder/Visitor";

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
  private recorderA: ReanimatedRecorder;
  private recorderB: ReanimatedRecorder;
  private currentRecorder: ReanimatedRecorder;

  constructor(
    Skia: Skia,
    private nativeId: number
  ) {
    super(Skia);
    this.recorderA = new ReanimatedRecorder(Skia);
    this.recorderB = new ReanimatedRecorder(Skia);
    this.currentRecorder = this.recorderA;
    this.picture = Skia.Picture.MakePicture(null)!;
  }

  redraw() {
    if (this.mapperId !== null) {
      Rea.stopMapper(this.mapperId);
    }
    if (this.unmounted) {
      return;
    }

    // Swap to the next recorder (double buffering)
    const recorder = this.currentRecorder;
    this.currentRecorder =
      this.currentRecorder === this.recorderA ? this.recorderB : this.recorderA;

    const { nativeId, picture } = this;
    recorder.reset();
    visit(recorder, this.root);
    const sharedValues = recorder.getSharedValues();
    const sharedRecorder = recorder.getRecorder();
    // Draw first frame
    Rea.executeOnUIRuntimeSync(() => {
      "worklet";
      nativeDrawOnscreen(nativeId, sharedRecorder, picture);
    })();
    // Animate
    if (sharedValues.length > 0) {
      this.mapperId = Rea.startMapper(() => {
        "worklet";
        sharedRecorder.applyUpdates(sharedValues);
        nativeDrawOnscreen(nativeId, sharedRecorder, picture);
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
