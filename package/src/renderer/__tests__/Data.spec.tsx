import React from "react";

import { processResult } from "../../__tests__/setup";
import { Fill } from "../components";
import * as SkiaRenderer from "../index";
import type { SkData } from "../../skia/types/Data/Data";

import type { EmptyProps } from "./setup";
import { mountCanvas, importSkia } from "./setup";

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const CheckData = ({}: EmptyProps) => {
  const { useFont } = importSkia();
  const font = useFont(null);
  if (font === null) {
    return <Fill color="green" />;
  }
  return <Fill color="red" />;
};

const CheckFont = ({}: EmptyProps) => {
  const { useFont } = importSkia();
  const font = useFont("skia/__tests__/assets/Roboto-Medium.ttf");
  if (!font) {
    return <Fill color="red" />;
  }
  return <Fill color="green" />;
};

const CheckImage = ({}: EmptyProps) => {
  const { useImage } = importSkia();
  const image = useImage("skia/__tests__/assets/zurich.jpg");
  if (!image) {
    return <Fill color="red" />;
  }
  return <Fill color="green" />;
};

const CheckDataCollection = ({}: EmptyProps) => {
  const { useDataCollection, Skia } = importSkia();
  const font = useDataCollection(
    [
      "skia/__tests__/assets/Roboto-Medium.ttf",
      "skia/__tests__/assets/Roboto-Medium.ttf",
    ],
    (data: SkData) => Skia.Typeface.MakeFreeTypeFaceFromData(data)
  );
  if (!font) {
    return <Fill color="red" />;
  }
  return <Fill color="green" />;
};

describe("Data Loading", () => {
  it("Loads renderer without Skia", async () => {
    expect(SkiaRenderer).toBeDefined();
  });
  it("Should accept null as an argument", async () => {
    const { surface, draw } = mountCanvas(<CheckData />);
    draw();
    processResult(surface, "snapshots/font/green.png");
    await wait(42);
    draw();
    processResult(surface, "snapshots/font/green.png");
  });

  it("Should load a font file", async () => {
    const { surface, draw } = mountCanvas(<CheckFont />);
    draw();
    processResult(surface, "snapshots/font/red.png");
    await wait(500);
    draw();
    processResult(surface, "snapshots/font/green.png");
  });

  it("Should load an image", async () => {
    const { surface, draw } = mountCanvas(<CheckImage />);
    draw();
    processResult(surface, "snapshots/font/red.png");
    await wait(500);
    draw();
    processResult(surface, "snapshots/font/green.png");
  });

  it("Should load many font files", async () => {
    const { surface, draw } = mountCanvas(<CheckDataCollection />);
    draw();
    processResult(surface, "snapshots/font/red.png");
    await wait(500);
    draw();
    processResult(surface, "snapshots/font/green.png");
  });
});
