import fs from "fs";
import path from "path";

import CanvasKitInit from "canvaskit-wasm";

import { JsiSkApi } from "../web";
import type { SkCanvas } from "../types/Canvas";

import { processResult, makeSurface } from "./snapshot";

let Skia: ReturnType<typeof JsiSkApi>;

beforeAll(async () => {
  const CanvasKit = await CanvasKitInit();
  Skia = JsiSkApi(CanvasKit);
});

describe("Test transforms", () => {
  it("Check that CanvasKit and CanvasKit are loaded", async () => {
    expect(Skia).toBeDefined();
  });
  it("Test rotate", () => {
    testTransform((canvas) => {
      canvas.scale(0.75, 0.75);
      canvas.rotate(-30, 0, 0);
    }, "snapshots/transform-rotate.png");
  });

  it("Test skew", () => {
    testTransform((canvas) => {
      canvas.skew(-Math.PI / 6, 0);
    }, "snapshots/transform-skew.png");
  });

  it("Test scale", () => {
    testTransform((canvas) => {
      canvas.scale(2, 1);
    }, "snapshots/transform-scale.png");
  });
});

const testTransform = (cb: (canvas: SkCanvas) => void, result: string) => {
  const { canvas, surface, center, width } = makeSurface(Skia);
  const aspectRatio = 836 / 1324;
  const CARD_WIDTH = width - 64;
  const CARD_HEIGHT = CARD_WIDTH * aspectRatio;
  const rect = Skia.XYWHRect(
    center.x - CARD_WIDTH / 2,
    center.y - CARD_HEIGHT / 2,
    CARD_WIDTH,
    CARD_HEIGHT
  );
  const image = Skia.Image.MakeImageFromEncoded(
    Skia.Data.fromBytes(fs.readFileSync(path.resolve(__dirname, "./card.png")))
  )!;
  const imgRect = Skia.XYWHRect(0, 0, image.width(), image.height());
  canvas.save();

  //  we pivot on the center of the card
  canvas.translate(center.x, center.y);
  cb(canvas);
  canvas.translate(-center.x, -center.y);

  const paint = Skia.Paint();
  canvas.drawImageRect(image, imgRect, rect, paint);
  canvas.restore();

  processResult(surface, result);
};
