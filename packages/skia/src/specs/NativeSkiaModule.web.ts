import type { ISkiaViewApi } from "../views/types";

declare global {
  var SkiaViewApi: ISkiaViewApi;
}

global.SkiaViewApi = {
      setJsiProperty: <T>(nativeId: number, name: string, value: T) => void;
      requestRedraw: (nativeId: number) => void;
      makeImageSnapshot: (nativeId: number, rect?: SkRect) => SkImage;
      makeImageSnapshotAsync: (nativeId: number, rect?: SkRect) => Promise<SkImage>;
};
