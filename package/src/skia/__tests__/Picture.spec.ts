import fs from "fs";
import path from "path";

import { processResult, savePicture } from "../../__tests__/setup";
import { StrokeCap, StrokeJoin } from "../types/Paint/Paint";
import { fitbox } from "../../renderer/components/shapes/FitBox";
import { processTransform } from "../types/Matrix";
import { ClipOp, TileMode } from "../types";

import { setupSkia } from "./setup";

describe("Drawings", () => {
  it("should save a lightblue rectangle as picture", () => {
    const { Skia, width, height } = setupSkia();
    const recorder = Skia.PictureRecorder();
    const canvas = recorder.beginRecording(Skia.XYWHRect(0, 0, width, height));

    const paint = Skia.Paint();
    paint.setColor(Skia.Color("lightblue"));
    const rct = Skia.XYWHRect(64, 64, 128, 128);
    canvas.drawRect(rct, paint);
    const picture = recorder.finishRecordingAsPicture();

    savePicture(picture, "snapshots/pictures/lightblue-rectangle.skp");
  });

  it("should save the twitter logo as picture", () => {
    const { Skia, width, height } = setupSkia();
    const recorder = Skia.PictureRecorder();
    const canvas = recorder.beginRecording(Skia.XYWHRect(0, 0, width, height));

    const paint = Skia.Paint();
    paint.setColor(Skia.Color("lightblue"));
    paint.setStrokeCap(StrokeCap.Round);
    paint.setStrokeJoin(StrokeJoin.Round);
    const path = Skia.Path.MakeFromSVGString(
      // eslint-disable-next-line max-len
      "M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"
    )!;
    expect(path).toBeTruthy();
    canvas.save();
    canvas.concat(
      processTransform(
        Skia.Matrix(),
        fitbox(
          "contain",
          Skia.XYWHRect(0, 0, 24, 24),
          Skia.XYWHRect(0, 0, width, height)
        )
      )
    );
    canvas.drawPath(path, paint);
    canvas.restore();
    const picture = recorder.finishRecordingAsPicture();

    savePicture(picture, "snapshots/pictures/twitter.skp");
  });

  it("should display an image with a backdrop blur", () => {
    const { Skia, width, height, surface } = setupSkia();
    const recorder = Skia.PictureRecorder();
    const canvas = recorder.beginRecording(Skia.XYWHRect(0, 0, width, height));
    const paint = Skia.Paint();
    const image = Skia.Image.MakeImageFromEncoded(
      Skia.Data.fromBytes(
        fs.readFileSync(path.resolve(__dirname, "./assets/zurich.jpg"))
      )
    )!;
    const imgRect = Skia.XYWHRect(0, 0, image.width(), image.height());
    canvas.drawImageRect(
      image,
      imgRect,
      Skia.XYWHRect(0, 0, width, height),
      paint
    );
    const backdropFilter = Skia.ImageFilter.MakeBlur(
      20,
      20,
      TileMode.Clamp,
      null
    );
    canvas.save();
    canvas.clipRect(
      Skia.XYWHRect(0, height - 100, width, 100),
      ClipOp.Intersect,
      true
    );
    canvas.saveLayer(undefined, null, backdropFilter);
    canvas.restore();
    canvas.restore();
    const picture = recorder.finishRecordingAsPicture();

    const surfaceCanvas = surface.getCanvas();
    surfaceCanvas.drawPicture(picture);

    processResult(surface, "snapshots/pictures/image.png", true);
    savePicture(picture, "snapshots/pictures/image.skp", true);
  });
});
