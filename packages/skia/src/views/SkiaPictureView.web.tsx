import type { SkCanvas } from "../skia/types";

import type { SkiaPictureViewNativeProps } from "./types";
import { SkiaBaseWebView } from "./SkiaBaseWebView";

export class SkiaPictureView extends SkiaBaseWebView<SkiaPictureViewNativeProps> {
  constructor(props: SkiaPictureViewNativeProps) {
    super(props);
  }

  protected renderInCanvas(canvas: SkCanvas): void {
    if (this.props.picture) {
      canvas.drawPicture(this.props.picture);
    }
  }
}
