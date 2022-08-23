import React, { useEffect, useState } from "react";

import { processResult } from "../../__tests__/setup";
import { Fill, Picture, Group } from "../components";

import type { EmptyProps } from "./setup";
import { wait, importSkia, mountCanvas, width } from "./setup";

const CheckPicture = ({}: EmptyProps) => {
  const { usePicture, Skia } = importSkia();
  const [color, setColor] = useState("green");
  const r = width / 2;
  useEffect(() => {
    setTimeout(() => {
      setColor("red");
    }, 16);
  }, [Skia]);
  const picture = usePicture(
    Skia.XYWHRect(0, 0, r * 2, r * 2),
    (canvas) => {
      const paint = Skia.Paint();
      paint.setColor(Skia.Color(color));
      canvas.drawCircle(r, r, r, paint);
    },
    [color]
  );
  return (
    <Group>
      <Fill color="white" />
      <Picture picture={picture} />
    </Group>
  );
};

const CheckPicture2 = ({}: EmptyProps) => {
  const { usePicture, Skia } = importSkia();
  const [color, setColor] = useState("green");
  const r = width / 2;
  useEffect(() => {
    setTimeout(() => {
      setColor("red");
    }, 16);
  }, [Skia]);
  const picture = usePicture(Skia.XYWHRect(0, 0, r * 2, r * 2), (canvas) => {
    const paint = Skia.Paint();
    paint.setColor(Skia.Color(color));
    canvas.drawCircle(r, r, r, paint);
  });
  return (
    <Group>
      <Fill color="white" />
      <Picture picture={picture} />
    </Group>
  );
};

describe("Picture", () => {
  it("should respect dependency array", async () => {
    const { surface, draw } = mountCanvas(<CheckPicture />);
    draw();
    processResult(surface, "snapshots/pictures/green.png");
    await wait(32);
    draw();
    processResult(surface, "snapshots/pictures/red.png");
  });

  it("should not redraw if there are no dependency", async () => {
    const { surface, draw } = mountCanvas(<CheckPicture2 />);
    draw();
    processResult(surface, "snapshots/pictures/green.png");
    await wait(32);
    draw();
    processResult(surface, "snapshots/pictures/green.png");
  });
});
