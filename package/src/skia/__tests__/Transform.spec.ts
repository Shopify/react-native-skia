import fs from "fs";
import path from "path";

import CanvasKitInit from "canvaskit-wasm";

import { JsiSkApi } from "../web";

import { processResult } from "./snapshot";

let Skia: ReturnType<typeof JsiSkApi>;
const width = 256;
const height = 256;
const center = { x: width / 2, y: height / 2 };
const aspectRatio = 836 / 1324;
const CARD_WIDTH = width - 64;
const CARD_HEIGHT = CARD_WIDTH * aspectRatio;

beforeAll(async () => {
  const CanvasKit = await CanvasKitInit();
  Skia = JsiSkApi(CanvasKit);
});

describe("Test transforms", () => {
  it("Check that CanvasKit and CanvasKit are loaded", async () => {
    expect(Skia).toBeDefined();
  });
  it("Test rotate", () => {
    const surface = Skia.Surface.Make(width, height)!;
    expect(surface).toBeDefined();
    const canvas = surface.getCanvas();
    const rect = Skia.XYWHRect(
      center.x - CARD_WIDTH / 2,
      center.y - CARD_HEIGHT / 2,
      CARD_WIDTH,
      CARD_HEIGHT
    );
    const image = Skia.Image.MakeImageFromEncoded(
      Skia.Data.fromBytes(
        fs.readFileSync(path.resolve(__dirname, "./card.png"))
      )
    )!;
    const imgRect = Skia.XYWHRect(0, 0, image.width(), image.height());
    canvas.save();
    canvas.rotate(-30, center.x, center.y);

    //  we pivot on the center of the card
    canvas.translate(center.x, center.y);
    canvas.scale(0.75, 0.75);
    canvas.translate(-center.x, -center.y);

    const paint = Skia.Paint();
    canvas.drawImageRect(image, imgRect, rect, paint);
    canvas.restore();

    processResult(surface, "snapshots/transform-rotate.png");
  });

  it("Test skew", () => {
    const surface = Skia.Surface.Make(width, height)!;
    expect(surface).toBeDefined();
    const canvas = surface.getCanvas();
    const rect = Skia.XYWHRect(
      center.x - CARD_WIDTH / 2,
      center.y - CARD_HEIGHT / 2,
      CARD_WIDTH,
      CARD_HEIGHT
    );
    const image = Skia.Image.MakeImageFromEncoded(
      Skia.Data.fromBytes(
        fs.readFileSync(path.resolve(__dirname, "./card.png"))
      )
    )!;
    const imgRect = Skia.XYWHRect(0, 0, image.width(), image.height());
    canvas.save();
    canvas.rotate(-30, center.x, center.y);

    //  we pivot on the center of the card
    canvas.translate(center.x, center.y);
    canvas.skew(-Math.PI / 6, 0);
    canvas.translate(-center.x, -center.y);

    const paint = Skia.Paint();
    canvas.drawImageRect(image, imgRect, rect, paint);
    canvas.restore();

    processResult(surface, "snapshots/transform-skew.png");
  });

  it("Test scale", () => {
    const surface = Skia.Surface.Make(width, height)!;
    expect(surface).toBeDefined();
    const canvas = surface.getCanvas();
    const rect = Skia.XYWHRect(
      center.x - CARD_WIDTH / 2,
      center.y - CARD_HEIGHT / 2,
      CARD_WIDTH,
      CARD_HEIGHT
    );
    const image = Skia.Image.MakeImageFromEncoded(
      Skia.Data.fromBytes(
        fs.readFileSync(path.resolve(__dirname, "./card.png"))
      )
    )!;
    const imgRect = Skia.XYWHRect(0, 0, image.width(), image.height());
    canvas.save();

    //  we pivot on the center of the card
    canvas.translate(center.x, center.y);
    canvas.scale(2, 1);
    canvas.translate(-center.x, -center.y);

    const paint = Skia.Paint();
    canvas.drawImageRect(image, imgRect, rect, paint);
    canvas.restore();

    processResult(surface, "snapshots/transform-scale.png");
  });
});
