import { surface } from "../setup";
import { checkImage, docPath } from "../../../__tests__/setup";
import { tigerPaths } from "./setup/tigerPaths";

describe("Tiger", () => {
  it("Should draw the Ghostscript Tiger using a Picture", async () => {
    const image = await surface.drawOffscreen(
      (Skia, canvas, { size, paths }) => {
        const recorder = Skia.PictureRecorder();
        const pictureCanvas = recorder.beginRecording(
          Skia.XYWHRect(0, 0, size, size)
        );

        // Scale to fit the canvas (original viewBox is 200x200)
        const scale = size / 200;
        pictureCanvas.save();
        pictureCanvas.scale(scale, scale);

        // Draw each path from the tiger data
        for (const pathData of paths) {
          const path = Skia.Path.MakeFromSVGString(pathData.d);
          if (!path) {
            continue;
          }

          // Draw fill if present
          if (pathData.fill) {
            const fillPaint = Skia.Paint();
            fillPaint.setStyle(0); // Fill
            fillPaint.setColor(Skia.Color(pathData.fill));
            pictureCanvas.drawPath(path, fillPaint);
          }

          // Draw stroke if present
          if (pathData.stroke) {
            const strokePaint = Skia.Paint();
            strokePaint.setStyle(1); // Stroke
            strokePaint.setColor(Skia.Color(pathData.stroke));
            strokePaint.setStrokeWidth(pathData.strokeWidth ?? 1);
            pictureCanvas.drawPath(path, strokePaint);
          }
        }

        pictureCanvas.restore();

        const picture = recorder.finishRecordingAsPicture();
        canvas.drawPicture(picture);
      },
      { size: surface.width, paths: tigerPaths }
    );
    checkImage(image, docPath("tiger.png"));
  });
});
