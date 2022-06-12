import "isomorphic-fetch";

import React from "react";

import { Fill } from "../components";
import { processResult } from "../../__tests__/setup";
import { useRawData } from "../../skia/types";

import { mountSurface, Skia } from "./setup";

const wait = (ms: number) => {
  return new Promise(function (resolve) {
    setTimeout(resolve, ms);
  });
};

const RemoteImage = () => {
  const image = useRawData(
    Skia,
    "https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_272x92dp.png",
    (data) => Skia.Image.MakeImageFromEncoded(data)
  );
  if (!image) {
    return <Fill color="red" />;
  }
  return <Fill color="lightblue" />;
};

describe("Test image loading and drawing", () => {
  it("Should load and draw and image via http", async () => {
    const { surface, draw } = mountSurface(<RemoteImage />);
    draw();
    // Image is not loaded yet: show red
    processResult(surface, "snapshots/drawings/red.png");
    await wait(1500);
    draw();
    // Image is loaded: show lightblue
    processResult(surface, "snapshots/drawings/lightblue.png");
    await wait(1500);
    draw();
    // Image hasn't changed: show lightblue
    processResult(surface, "snapshots/drawings/lightblue.png");
  });
});
