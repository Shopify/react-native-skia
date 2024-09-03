import React from "react";

import { importSkia, surface } from "../setup";
import { checkImage, docPath, itRunsNodeOnly } from "../../../__tests__/setup";
import { Blur, Group, Paint, Picture } from "../../components";
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
  itRunsNodeOnly("Should use createPicture", async () => {
    const { createPicture, Skia } = importSkia();
    const picture = createPicture((canvas) => {
      const size = 256;
      const r = 0.33 * size;
      const paint = Skia.Paint();
      paint.setBlendMode(BlendMode.Multiply);

      paint.setColor(Skia.Color("cyan"));
      canvas.drawCircle(r, r, r, paint);

      paint.setColor(Skia.Color("magenta"));
      canvas.drawCircle(size - r, r, r, paint);

      paint.setColor(Skia.Color("yellow"));
      canvas.drawCircle(size / 2, size - r, r, paint);
    });
    expect(picture).toBeDefined();
    const image = await surface.drawOffscreen(
      (_, canvas, ctx) => {
        canvas.drawPicture(ctx.picture);
      },
      { picture }
    );
    checkImage(image, "snapshots/pictures/create-picture.png");
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
  it("Simple picture example", async () => {
    const img = await surface.drawOffscreen(
      (Skia, canvas, ctx) => {
        const { size } = ctx;
        const r = 0.33 * size;
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
    checkImage(img, docPath("simple-picture.png"));
  });
  itRunsNodeOnly("Blur Picture", async () => {
    const { Skia, createPicture } = importSkia();
    const picture = createPicture((canvas) => {
      const size = 256;
      const r = 0.33 * size;
      const paint = Skia.Paint();
      paint.setBlendMode(BlendMode.Multiply);

      paint.setColor(Skia.Color("cyan"));
      canvas.drawCircle(r, r, r, paint);

      paint.setColor(Skia.Color("magenta"));
      canvas.drawCircle(size - r, r, r, paint);

      paint.setColor(Skia.Color("yellow"));
      canvas.drawCircle(size / 2, size - r, r, paint);
    });

    const img = await surface.draw(
      <>
        <Group
          layer={
            <Paint>
              <Blur blur={10} />
            </Paint>
          }
        >
          <Picture picture={picture} />
        </Group>
      </>
    );
    checkImage(img, docPath("blurred-picture.png"));
  });
});
