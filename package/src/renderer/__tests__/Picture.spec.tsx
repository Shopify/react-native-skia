import React, { useEffect, useState } from "react";

import { processResult } from "../../__tests__/setup";
import { Picture } from "../components/Picture";

import type { EmptyProps } from "./setup";
import { wait, importSkia, mountCanvas, width } from "./setup";

const CheckPicture = ({}: EmptyProps) => {
  const { usePicture, rect, Skia } = importSkia();
  const [color, setColor] = useState("green");
  const r = width / 2;
  useEffect(() => {
    setTimeout(() => {
      setColor("red");
    }, 32);
  }, [Skia]);
  const picture = usePicture(
    rect(0, 0, r * 2, r * 2),
    (canvas) => {
      const paint = Skia.Paint();
      paint.setColor(Skia.Color(color));
      canvas.drawCircle(r, r, r, paint);
    },
    [color]
  );
  return <Picture picture={picture} />;
};

describe("Picture", () => {
  it("should respect dependency array", async () => {
    const { surface, draw } = mountCanvas(<CheckPicture />);
    draw();
    processResult(surface, "snapshots/pictures/green.png");
    await wait(100);
    draw();
    processResult(surface, "snapshots/pictures/red.png");
  });
});
