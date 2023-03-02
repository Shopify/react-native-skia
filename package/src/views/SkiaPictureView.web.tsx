import type { SkCanvas } from "../skia/types";

import type { SkiaPictureViewProps } from "./types";
import { SkiaBaseWebView } from "./SkiaBaseWebView";

export class SkiaPictureView extends SkiaBaseWebView<SkiaPictureViewProps> {
  constructor(props: SkiaPictureViewProps) {
    super(props);
  }

  protected renderInCanvas(canvas: SkCanvas): void {
    if (this.props.picture) {
      canvas.drawPicture(this.props.picture);
    }
  }
}
