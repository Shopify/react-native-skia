import { processResult } from "../../__tests__/setup";

import { setupSkia } from "./setup";

describe("FontMgr", () => {
  it("FontMgr polyfill loads properly", () => {
    const { surface, canvas, Skia } = setupSkia();
    const paint = Skia.Paint();
    paint.setColor(Skia.Color("#16161d"));
    const tf = Skia.FontMgr.RefDefault().matchFamilyStyle("Lato");
    expect(tf).toBeDefined();
    const font = Skia.Font(tf!, 32);
    expect(font).toBeDefined();
    canvas.drawColor(Skia.Color("white"));
    canvas.drawText("Hello World", 64, 64, paint, font);
    processResult(surface, "snapshots/drawings/hello-world.png", true);
  });
});
