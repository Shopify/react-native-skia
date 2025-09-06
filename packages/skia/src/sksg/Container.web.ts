import type { SharedValue } from "react-native-reanimated";

import Rea from "../external/reanimated/ReanimatedProxy";
import type { Skia, SkSize } from "../skia/types";
import { HAS_REANIMATED_3 } from "../external/reanimated/renderHelpers";

import type { Recording } from "./Recorder/Recorder";
import { Recorder } from "./Recorder/Recorder";
import { visit } from "./Recorder/Visitor";
import { replay } from "./Recorder/Player";
import { createDrawingContext } from "./Recorder/DrawingContext";
import { Container, StaticContainer } from "./StaticContainer";

import "../skia/NativeSetup";
import "../views/api";

const drawOnscreen = (Skia: Skia, nativeId: number, recording: Recording) => {
  "worklet";
  const rec = Skia.PictureRecorder();
  const canvas = rec.beginRecording();
  //const start = performance.now();

  const ctx = createDrawingContext(Skia, recording.paintPool, canvas);
  replay(ctx, recording.commands);
  const picture = rec.finishRecordingAsPicture();
  //const end = performance.now();
  //console.log("Recording time: ", end - start);
  SkiaViewApi.setJsiProperty(nativeId, "picture", picture);
};

class ReanimatedContainer extends Container {
  private mapperId: number | null = null;

  constructor(Skia: Skia, private nativeId: number) {
    super(Skia);
  }

  redraw() {
    if (this.mapperId !== null) {
      Rea.stopMapper(this.mapperId);
    }
    if (this.unmounted) {
      return;
    }
    const recorder = new Recorder();
    visit(recorder, this.root);
    const record = recorder.getRecording();
    const { animationValues } = record;
    this.recording = {
      commands: record.commands,
      paintPool: record.paintPool,
    };
    const { nativeId, Skia, recording } = this;
    if (animationValues.size > 0) {
      this.mapperId = Rea.startMapper(() => {
        "worklet";
        drawOnscreen(Skia, nativeId, recording!);
      }, Array.from(animationValues));
    }
    Rea.runOnUI(() => {
      "worklet";
      drawOnscreen(Skia, nativeId, recording!);
    })();
  }
}

export const createContainer = (
  Skia: Skia,
  nativeId: number,
  _onSize?: SharedValue<SkSize>
) => {
  if (HAS_REANIMATED_3 && nativeId !== -1) {
    return new ReanimatedContainer(Skia, nativeId);
  } else {
    return new StaticContainer(Skia, nativeId);
  }
};
