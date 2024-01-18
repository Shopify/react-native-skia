import React from "react";

import { checkImage } from "../../../__tests__/setup";
import { importSkia, surface } from "../setup";
import { Atlas } from "../../components";

describe("Atlas", () => {
  it("should read the RSXform properties", async () => {
    const result = await surface.eval((Skia) => {
      const transform = Skia.RSXform(1, 2, 3, 4);
      return [transform.scos, transform.ssin, transform.tx, transform.ty];
    });
    expect(result).toEqual([1, 2, 3, 4]);
  });
  it("should draw the atlas using the imperative API", async () => {
    const img = await surface.drawOffscreen((Skia, canvas) => {
      const size = 200;
      const texSurface = Skia.Surface.MakeOffscreen(size, size)!;
      const texCanvas = texSurface.getCanvas();
      texCanvas.drawColor(Skia.Color("red"));
      const tex = texSurface.makeImageSnapshot();
      const srcs = [
        Skia.XYWHRect(0, 0, size, size),
        Skia.XYWHRect(0, 0, size, size),
      ];
      const dsts = [Skia.RSXform(0.5, 0, 0, 0), Skia.RSXform(0, 0.5, 200, 100)];
      const paint = Skia.Paint();
      canvas.drawAtlas(tex, srcs, dsts, paint);
    });
    checkImage(img, "snapshots/atlas/simple.png");
  });
  it("should accept RSXform as JS", async () => {
    const img = await surface.drawOffscreen((Skia, canvas) => {
      const size = 200;
      const texSurface = Skia.Surface.MakeOffscreen(size, size)!;
      const texCanvas = texSurface.getCanvas();
      texCanvas.drawColor(Skia.Color("red"));
      const tex = texSurface.makeImageSnapshot();
      const srcs = [
        Skia.XYWHRect(0, 0, size, size),
        Skia.XYWHRect(0, 0, size, size),
      ];
      const dsts = [
        { scos: 0.5, ssin: 0, tx: 0, ty: 0 },
        { scos: 0, ssin: 0.5, tx: 200, ty: 100 },
      ];
      const paint = Skia.Paint();
      canvas.drawAtlas(tex, srcs, dsts, paint);
    });
    checkImage(img, "snapshots/atlas/simple.png");
  });
  it("Simple Atlas", async () => {
    const { Skia } = importSkia();
    const size = 75;
    const texSurface = Skia.Surface.MakeOffscreen(size, size)!;
    const texCanvas = texSurface.getCanvas();
    texCanvas.drawColor(Skia.Color("red"));
    const image = texSurface.makeImageSnapshot();
    const img = await surface.draw(
      <Atlas
        image={image}
        sprites={[
          Skia.XYWHRect(0, 0, size, size),
          Skia.XYWHRect(0, 0, size, size),
        ]}
        transforms={[Skia.RSXform(0.5, 0, 0, 0), Skia.RSXform(0, 0.5, 50, 50)]}
      />
    );
    checkImage(img, "snapshots/atlas/simple2.png");
  });
  it("Simple Atlas identity", async () => {
    const { Skia } = importSkia();
    const size = 75;
    const texSurface = Skia.Surface.MakeOffscreen(size, size)!;
    const texCanvas = texSurface.getCanvas();
    texCanvas.drawColor(Skia.Color("red"));
    const image = texSurface.makeImageSnapshot();
    const img = await surface.draw(
      <Atlas
        image={image}
        sprites={[
          Skia.XYWHRect(0, 0, size, size),
          Skia.XYWHRect(0, 0, size, size),
        ]}
        transforms={[Skia.RSXform(1, 0, 0, 0), Skia.RSXform(1, 0, 0, 0)]}
      />
    );
    checkImage(img, "snapshots/atlas/identity.png");
  });
});
