import type { SharedValue } from "react-native-reanimated";

import Rea from "../external/reanimated/ReanimatedProxy";
import type { Skia, SkSize } from "../skia/types";
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
  onSize?: SharedValue<SkSize>
) => {
  "worklet";
  if (onSize) {
    SkiaViewApi.setJsiProperty(nativeId, "onSize", onSize);
  }
  //const start = performance.now();
  const picture = recorder.play();
  //const end = performance.now();
  //console.log("Recording time: ", end - start);
  SkiaViewApi.setJsiProperty(nativeId, "picture", picture);
};

class NativeReanimatedContainer extends Container {
  private mapperId: number | null = null;

  constructor(
    Skia: Skia,
    private nativeId: number,
    private onSize?: SharedValue<SkSize>
  ) {
    super(Skia);
  }

  redraw() {
    if (this.mapperId !== null) {
      Rea.stopMapper(this.mapperId);
    }
    if (this.unmounted) {
      return;
    }
    const { nativeId, Skia } = this;
    const recorder = new ReanimatedRecorder(Skia);
    visit(recorder, this.root);
    const sharedValues = recorder.getSharedValues();
    const sharedRecorder = recorder.getRecorder();
    Rea.runOnUI((onSize?: SharedValue<SkSize>) => {
      "worklet";
      nativeDrawOnscreen(nativeId, sharedRecorder, onSize);
    })(this.onSize);
    if (sharedValues.length > 0) {
      const { onSize } = this;
      this.mapperId = Rea.startMapper(() => {
        "worklet";
        sharedRecorder.applyUpdates(sharedValues);
        nativeDrawOnscreen(nativeId, sharedRecorder, onSize);
      }, sharedValues);
    }
  }
}

export const createContainer = (
  Skia: Skia,
  nativeId: number,
  onSize?: SharedValue<SkSize>
) => {
  if (HAS_REANIMATED_3 && nativeId !== -1) {
    return new NativeReanimatedContainer(Skia, nativeId, onSize);
  } else {
    return new StaticContainer(Skia, nativeId);
  }
};
