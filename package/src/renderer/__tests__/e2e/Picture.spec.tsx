import { importSkia, surface } from "../setup";
import { checkImage } from "../../../__tests__/setup";
import { BlendMode } from "../../../skia/types";

describe("Pictures", () => {
  it("Should draw a simple picture", async () => {
    const { Skia } = importSkia();
    const str = await surface.eval((Sk) => {
      const size = 256;
      const surf = Sk.Surface.MakeOffscreen(size, size)!;
      const canvas = surf.getCanvas();
      const recorder = Sk.PictureRecorder();
      const canvas2 = recorder.beginRecording(Sk.XYWHRect(0, 0, size, size));
      canvas2.drawColor(Sk.Color("cyan"));
      const picture = recorder.finishRecordingAsPicture();
      canvas.drawPicture(picture);
      return surf.makeImageSnapshot().encodeToBase64();
    });
    const image = Skia.Image.MakeImageFromEncoded(Skia.Data.fromBase64(str))!;
    checkImage(image, "snapshots/pictures/simple-picture.png");
  });
  it("Should draw the hello world example as picture", async () => {
    const { Skia } = importSkia();
    const str = await surface.eval(
      (Sk, ctx) => {
        const { size } = ctx;
        const r = size * 0.33;
        const surf = Sk.Surface.MakeOffscreen(size, size)!;
        const canvas = surf.getCanvas();
        const recorder = Sk.PictureRecorder();
        const canvas2 = recorder.beginRecording(Sk.XYWHRect(0, 0, size, size));
        const paint = Sk.Paint();
        paint.setBlendMode(ctx.BlendMode);
        paint.setColor(Sk.Color("cyan"));
        canvas2.drawCircle(r, r, r, paint);
        paint.setColor(Sk.Color("magenta"));
        canvas2.drawCircle(size - r, r, r, paint);
        paint.setColor(Sk.Color("yellow"));
        canvas2.drawCircle(size / 2, size - r, r, paint);
        const picture = recorder.finishRecordingAsPicture();
        canvas.drawPicture(picture);
        surf.flush();
        return surf.makeImageSnapshot().encodeToBase64();
      },
      { BlendMode: BlendMode.Multiply, size: surface.width }
    );
    const image = Skia.Image.MakeImageFromEncoded(Skia.Data.fromBase64(str))!;
    checkImage(image, "snapshots/pictures/hello-world.png");
  });
});
