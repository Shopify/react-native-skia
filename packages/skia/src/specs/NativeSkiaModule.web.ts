/* eslint-disable import/no-anonymous-default-export */
import type { SkPicture, SkRect } from "../skia/types";
import type { ISkiaViewApi } from "../views/types";
import type { SkiaPictureViewHandle } from "../views/SkiaPictureView.web";

export type ISkiaViewApiWeb = ISkiaViewApi & {
  views: Record<string, SkiaPictureViewHandle>;
  deferedPictures: Record<string, SkPicture>;
  registerView(nativeId: string, view: SkiaPictureViewHandle): void;
};

global.SkiaViewApi = {
  views: {},
  deferedPictures: {},
  deferedOnSize: {},
  web: true,
  registerView(nativeId: string, view: SkiaPictureViewHandle) {
    // Maybe a picture for this view was already set
    if (this.deferedPictures[nativeId]) {
      view.setPicture(this.deferedPictures[nativeId] as SkPicture);
    }
    this.views[nativeId] = view;
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setJsiProperty(nativeId: number, name: string, value: any) {
    if (name === "picture") {
      if (!this.views[`${nativeId}`]) {
        this.deferedPictures[`${nativeId}`] = value;
      } else {
        this.views[`${nativeId}`].setPicture(value);
      }
    }
  },
  size(nativeId: number) {
    if (this.views[`${nativeId}`]) {
      return this.views[`${nativeId}`].getSize();
    } else {
      return { width: 0, height: 0 };
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
