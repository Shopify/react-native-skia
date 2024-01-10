import { surface } from "../setup";
import { checkImage } from "../../../__tests__/setup";
import { BlendMode } from "../../../skia/types";

describe("Pictures", () => {
  it("Should draw a simple picture", async () => {
    const image = await surface.drawOffscreen(
      (Skia, canvas, { size }) => {
        const recorder = Skia.PictureRecorder();
        const canvas2 = recorder.beginRecording(
          Skia.XYWHRect(0, 0, size, size)
        );
        canvas2.drawColor(Skia.Color("cyan"));
        const picture = recorder.finishRecordingAsPicture();
        canvas.drawPicture(picture);
      },
      { size: surface.width }
    );
    checkImage(image, "snapshots/pictures/simple-picture.png");
  });
  it("Should draw the hello world example as picture", async () => {
    const image = await surface.drawOffscreen(
      (Skia, canvas, ctx) => {
        const { size } = ctx;
        const r = size * 0.33;
        const recorder = Skia.PictureRecorder();
        const canvas2 = recorder.beginRecording(
          Skia.XYWHRect(0, 0, size, size)
        );
        const paint = Skia.Paint();
        paint.setBlendMode(ctx.BlendMode);
        paint.setColor(Skia.Color("cyan"));
        canvas2.drawCircle(r, r, r, paint);
        paint.setColor(Skia.Color("magenta"));
        canvas2.drawCircle(size - r, r, r, paint);
        paint.setColor(Skia.Color("yellow"));
        canvas2.drawCircle(size / 2, size - r, r, paint);
        const picture = recorder.finishRecordingAsPicture();
        canvas.drawPicture(picture);
      },
      { BlendMode: BlendMode.Multiply, size: surface.width }
    );
    checkImage(image, "snapshots/pictures/hello-world.png");
  });
});
