import React, { useEffect, useRef, useState } from "react";

import { processResult } from "../../__tests__/setup";
import { Fill, Image } from "../components";
import * as SkiaRenderer from "../index";

import type { EmptyProps } from "./setup";
import { importSkia, mountCanvas, width, height, wait } from "./setup";

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

const CheckTogglingImage = ({}: EmptyProps) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const h = useRef<any>(0);
  const [idx, setIdx] = useState(0);
  const { useImage } = importSkia();
  const zurich = useImage("skia/__tests__/assets/zurich.jpg");
  const oslo = useImage("skia/__tests__/assets/oslo.jpg");
  useEffect(() => {
    if (oslo && zurich) {
      h.current = setTimeout(() => {
        setIdx(1);
      }, 20);
    }
    return () => {
      clearTimeout(h.current);
    };
  }, [zurich, oslo]);
  if (!zurich || !oslo) {
    return <Fill color="red" />;
  }
  const images = [zurich, oslo];
  const image = images[idx];
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

const sources = [
  "skia/__tests__/assets/zurich.jpg",
  "skia/__tests__/assets/oslo.jpg",
];

const CheckChangingImage = ({}: EmptyProps) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const h = useRef<any>(0);
  const [idx, setIdx] = useState(0);
  const { useImage } = importSkia();
  const image = useImage(sources[idx]);
  useEffect(() => {
    if (image) {
      h.current = setTimeout(() => {
        setIdx(1);
      }, 20);
    }
    return () => {
      clearTimeout(h.current);
    };
  }, [image]);
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

describe("Data Loading", () => {
  it("Loads renderer without Skia", async () => {
    expect(SkiaRenderer).toBeDefined();
  });
  it("Should accept null as an argument", async () => {
    const { surface, draw, unmount } = mountCanvas(<CheckData />);
    draw();
    processResult(surface, "snapshots/font/green.png");
    await wait(42);
    draw();
    processResult(surface, "snapshots/font/green.png");
    unmount();
  });

  it("Should load a font file", async () => {
    const { surface, draw, unmount } = mountCanvas(<CheckFont />);
    draw();
    processResult(surface, "snapshots/font/red.png");
    await wait(500);
    draw();
    processResult(surface, "snapshots/font/green.png");
    unmount();
  });

  it("Should load an image", async () => {
    const { surface, draw, unmount } = mountCanvas(<CheckImage />);
    draw();
    processResult(surface, "snapshots/font/red.png");
    await wait(500);
    draw();
    processResult(surface, "snapshots/font/green.png");
    unmount();
  });

  it("Should toggle the image to change", async () => {
    const { surface, draw, unmount } = mountCanvas(<CheckTogglingImage />);
    draw();
    processResult(surface, "snapshots/data/red.png");
    await wait(10);
    draw();
    processResult(surface, "snapshots/data/zurich.png");
    await wait(30);
    draw();
    processResult(surface, "snapshots/data/oslo.png");
    unmount();
  });

  it("Should allow for the source image to change", async () => {
    const { surface, draw, unmount } = mountCanvas(<CheckChangingImage />);
    draw();
    processResult(surface, "snapshots/data/red.png");
    await wait(10);
    draw();
    processResult(surface, "snapshots/data/zurich.png");
    await wait(30);
    draw();
    processResult(surface, "snapshots/data/oslo.png");
    unmount();
  });
});
