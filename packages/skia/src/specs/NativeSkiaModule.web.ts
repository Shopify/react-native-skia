/* eslint-disable import/no-anonymous-default-export */
import type { SkRect } from "../skia/types";
import type { ISkiaViewApi } from "../views/types";
import type { SkiaPictureView } from "../views/SkiaPictureView.web";

export type ISkiaViewApiWeb = ISkiaViewApi & {
  views: Record<string, SkiaPictureView>;
  registerView(nativeId: string, view: SkiaPictureView): void;
};

global.SkiaViewApi = {
  views: {},
  web: true,
  registerView(nativeId: string, view: SkiaPictureView) {
    this.views[nativeId] = view;
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setJsiProperty(nativeId: number, name: string, value: any) {
    if (name === "picture") {
      this.views[`${nativeId}`].setPicture(value);
    }
  },
  requestRedraw(nativeId: number) {
    this.views[`${nativeId}`].redraw();
  },
  makeImageSnapshot(nativeId: number, rect?: SkRect) {
    return this.views[`${nativeId}`].makeImageSnapshot(rect);
  },
  makeImageSnapshotAsync(nativeId: number, rect?: SkRect) {
    return new Promise((resolve, reject) => {
      const result = this.views[`${nativeId}`].makeImageSnapshot(rect);
      if (result) {
        resolve(result);
      } else {
        reject(new Error("Failed to make image snapshot"));
      }
    });
  },
} as ISkiaViewApiWeb;

// eslint-disable-next-line import/no-default-export
export default {};
