import Rea from "../external/reanimated/ReanimatedProxy";
import type { Skia, SkPicture } from "../skia/types";
import { HAS_REANIMATED_3 } from "../external/reanimated/renderHelpers";
import type { JsiRecorder } from "../skia/types/Recorder";

import { ReanimatedRecorder } from "./Recorder/ReanimatedRecorder";
import { Container, StaticContainer } from "./StaticContainer";
import { visit } from "./Recorder/Visitor";

import "../skia/NativeSetup";
import "../views/api";

// create local reference for `strictGlobal` option in Worklets
const { SkiaViewApi } = globalThis;

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

  unmount() {
    super.unmount();
    if (this.mapperId !== null) {
      // The mapper closure retains the recorder and its resources (e.g.
      // images) on the UI runtime and keeps updating the picture of an
      // unmounted view — stop it or it leaks for the lifetime of the app.
      Rea.stopMapper(this.mapperId);
      this.mapperId = null;
    }
  }

  redraw() {
    if (this.mapperId !== null) {
      Rea.stopMapper(this.mapperId);
      this.mapperId = null;
    }
    if (this.unmounted) {
      return;
    }
    const recorder = new ReanimatedRecorder(this.Skia);
    const { nativeId, picture } = this;
    visit(recorder, this.root);
    const sharedValues = recorder.getSharedValues();
    const sharedRecorder = recorder.getRecorder();
    // Draw first frame
    Rea.runOnUI(() => {
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
