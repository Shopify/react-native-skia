import path from "path";

import React, { useRef } from "react";

import { processResult } from "../../__tests__/setup";
import { Fill, Image } from "../components";
import * as SkiaRenderer from "../index";
import type { SkData } from "../../skia/types/Data/Data";

import { mountCanvas, nodeRequire, Skia, height, width } from "./setup";

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface EmptyProps {}

const CheckData = ({}: EmptyProps) => {
  const { useFont } = require("../../skia/core/Font");
  const font = useFont(null);
  if (font === null) {
    return <Fill color="green" />;
  }
  return <Fill color="red" />;
};

const CheckFont = ({}: EmptyProps) => {
  const { useFont } = require("../../skia/core/Font");
  const font = useFont(
    nodeRequire(
      path.resolve(__dirname, "../../skia/__tests__/assets/Roboto-Medium.ttf")
    )
  );
  if (!font) {
    return <Fill color="red" />;
  }
  return <Fill color="green" />;
};

const CheckImage = ({}: EmptyProps) => {
  const { useImage } = require("../../skia/core/Image");
  const image = useImage(
    nodeRequire(
      path.resolve(__dirname, "../../skia/__tests__/assets/zurich.jpg")
    )
  );
  if (!image) {
    return <Fill color="red" />;
  }
  return <Fill color="green" />;
};

const sources = [
  nodeRequire(
    path.resolve(__dirname, "../../skia/__tests__/assets/zurich.jpg")
  ),
  nodeRequire(path.resolve(__dirname, "../../skia/__tests__/assets/oslo.jpg")),
];

const CheckChangingImage = ({}: EmptyProps) => {
  const ref = useRef(-1);
  ref.current++;
  const { useImage } = require("../../skia/core/Image");
  const image = useImage(sources[ref.current % sources.length]);
  if (!image) {
    return <Fill color="red" />;
  }
  return (
    <Image
      image={image}
      x={0}
      y={0}
      width={width}
      height={height}
      fit="cover"
    />
  );
};

const CheckTogglingImage = ({}: EmptyProps) => {
  const renders = useRef(-1);
  renders.current++;
  const { useImage } = require("../../skia/core/Image");
  const zurich = useImage(
    nodeRequire(
      path.resolve(__dirname, "../../skia/__tests__/assets/zurich.jpg")
    )
  );
  const oslo = useImage(
    nodeRequire(path.resolve(__dirname, "../../skia/__tests__/assets/oslo.jpg"))
  );
  const images = [zurich, oslo];
  const idx = renders.current % sources.length;
  const image = images[idx];

  if (!zurich || !oslo) {
    return <Fill color="red" />;
  }
  console.log({ images: images.map((img) => !!img), idx });
  return (
    <Image
      image={image}
      x={0}
      y={0}
      width={width}
      height={height}
      fit="cover"
    />
  );
};

const CheckDataCollection = ({}: EmptyProps) => {
  const { useDataCollection } = require("../../skia/core/Data");
  const font = useDataCollection(
    [
      nodeRequire(
        path.resolve(__dirname, "../../skia/__tests__/assets/Roboto-Medium.ttf")
      ),
      nodeRequire(
        path.resolve(__dirname, "../../skia/__tests__/assets/Roboto-Medium.ttf")
      ),
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

  it("Should allow for the source image to change", async () => {
    const { surface, draw } = mountCanvas(<CheckChangingImage />);
    draw();
    await wait(500);
    draw();
    processResult(surface, "snapshots/data/zurich.png");
    await wait(500);
    draw();
    processResult(surface, "snapshots/data/zurich.png");
  });

  it("Should toggle the image to change", async () => {
    const { surface, draw, updateContainer } = mountCanvas(
      <CheckTogglingImage />
    );
    updateContainer();
    draw();
    // Nothing is loaded yet
    processResult(surface, "snapshots/data/red.png");
    await wait(10);
    updateContainer();
    draw();
    processResult(surface, "snapshots/data/zurich.png");
    // updateContainer();
    // draw();
    // processResult(surface, "snapshots/data/zurich2.png");
  });
});
