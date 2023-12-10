import { importSkia, surface } from "../setup";
import { checkImage } from "../../../__tests__/setup";

describe("Pictures", () => {
  it("Should draw a simple picture", async () => {
    const { Skia } = importSkia();
    //const { width } = surface;
    //const r = width * 0.33;
    const str = await surface.eval((Sk) => {
      const surf = Sk.Surface.MakeOffscreen(256, 256)!;
      const canvas = surf.getCanvas();
      const recorder = Sk.PictureRecorder();
      const canvas2 = recorder.beginRecording();
      canvas2.drawColor(Sk.Color("cyan"));
      const picture = recorder.finishRecordingAsPicture();
      canvas.drawPicture(picture);
      // TODO: remove makeNonTextureImage
      return surf.makeImageSnapshot().encodeToBase64();
    });
    const image = Skia.Image.MakeImageFromEncoded(Skia.Data.fromBase64(str))!;
    checkImage(image, "snapshots/pictures/simple-picture.png");
  });
});
