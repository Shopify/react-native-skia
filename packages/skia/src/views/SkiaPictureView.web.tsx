import type { SkCanvas, SkPicture } from "../skia/types";
import type { ISkiaViewApiWeb } from "../specs/NativeSkiaModule.web";

import type { SkiaPictureViewNativeProps } from "./types";
import { SkiaBaseWebView } from "./SkiaBaseWebView";

export class SkiaPictureView extends SkiaBaseWebView<SkiaPictureViewNativeProps> {
  private picture: SkPicture | null = null;

  constructor(props: SkiaPictureViewNativeProps) {
    super(props);
    const { nativeID } = props;
    if (!nativeID) {
      throw new Error("SkiaPictureView requires a nativeID prop");
    }
    (global.SkiaViewApi as ISkiaViewApiWeb).registerView(nativeID, this);
  }

  public setPicture(picture: SkPicture) {
    this.picture = picture;
    this.redraw();
  }

  protected renderInCanvas(canvas: SkCanvas): void {
    if (this.props.picture) {
      canvas.drawPicture(this.props.picture);
    } else if (this.picture) {
      canvas.drawPicture(this.picture);
    }
  }
}
