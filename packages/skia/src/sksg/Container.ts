import type { SharedValue } from "react-native-reanimated";

import Rea from "../external/reanimated/ReanimatedProxy";
import type { Skia, SkCanvas, SkSize } from "../skia/types";
import { HAS_REANIMATED_3 } from "../external/reanimated/renderHelpers";
import type { JsiRecorder } from "../skia/types/Recorder";

import type { Node } from "./Node";
import type { Recording } from "./Recorder/Recorder";
import { Recorder } from "./Recorder/Recorder";
import { visit } from "./Recorder/Visitor";
import { replay } from "./Recorder/Player";
import { createDrawingContext } from "./Recorder/DrawingContext";
import { ReanimatedRecorder } from "./Recorder/ReanimatedRecorder";

import "../views/api";

const drawOnscreen = (
  Skia: Skia,
  nativeId: number,
  recording: Recording,
  onSize?: SharedValue<SkSize>
) => {
  "worklet";
  if (onSize) {
    const size = SkiaViewApi.size(nativeId);
    if (
      size.width !== onSize.value.width ||
      size.height !== onSize.value.height
    ) {
      onSize.value = size;
    }
  }
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

const nativeDrawOnscreen = (
  nativeId: number,
  recorder: JsiRecorder,
  onSize?: SharedValue<SkSize>
) => {
  "worklet";

  //const start = performance.now();
  if (onSize) {
    const size = SkiaViewApi.size(nativeId);
    if (
      size.width !== onSize.value.width ||
      size.height !== onSize.value.height
    ) {
      onSize.value = size;
    }
  }
  const picture = recorder.play();
  //const end = performance.now();
  //console.log("Recording time: ", end - start);
  SkiaViewApi.setJsiProperty(nativeId, "picture", picture);
};

export abstract class Container {
  private _root: Node[] = [];
  protected recording: Recording | null = null;
  protected unmounted = false;

  constructor(protected Skia: Skia) {}

  get root() {
    return this._root;
  }

  set root(value: Node[]) {
    this._root = value;
  }

  mount() {
    this.unmounted = false;
  }

  unmount() {
    this.unmounted = true;
  }

  drawOnCanvas(canvas: SkCanvas) {
    if (!this.recording) {
      throw new Error("No recording to draw");
    }
    const ctx = createDrawingContext(
      this.Skia,
      this.recording.paintPool,
      canvas
    );
    replay(ctx, this.recording.commands);
  }

  abstract redraw(): void;
}

class StaticContainer extends Container {
  constructor(
    Skia: Skia,
    private nativeId: number,
    private onSize?: SharedValue<SkSize>
  ) {
    super(Skia);
  }

  redraw() {
    const recorder = new Recorder();
    visit(recorder, this.root);
    this.recording = recorder.getRecording();
    const isOnScreen = this.nativeId !== -1;
    if (isOnScreen) {
      if (this.onSize) {
        const size = SkiaViewApi.size(this.nativeId);
        if (
          size.width !== this.onSize.value.width ||
          size.height !== this.onSize.value.height
        ) {
          this.onSize.value = size;
        }
      }
      const rec = this.Skia.PictureRecorder();
      const canvas = rec.beginRecording();
      this.drawOnCanvas(canvas);
      const picture = rec.finishRecordingAsPicture();
      SkiaViewApi.setJsiProperty(this.nativeId, "picture", picture);
    }
  }
}

class ReanimatedContainer extends Container {
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
    Rea.runOnUI((onSize?: SharedValue<SkSize>) => {
      "worklet";
      drawOnscreen(Skia, nativeId, recording!, onSize);
    })(this.onSize);
  }
}

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
  const web = global.SkiaViewApi && global.SkiaViewApi.web;
  if (HAS_REANIMATED_3 && nativeId !== -1) {
    if (!web) {
      return new NativeReanimatedContainer(Skia, nativeId, onSize);
    } else {
      return new ReanimatedContainer(Skia, nativeId, onSize);
    }
  } else {
    return new StaticContainer(Skia, nativeId);
  }
};
