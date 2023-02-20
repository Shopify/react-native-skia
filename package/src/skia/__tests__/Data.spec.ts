import type { JsiSkData } from "../web/JsiSkData";
import { importSkia, resolveFile } from "../../renderer/__tests__/setup";

import { setupSkia } from "./setup";

describe("Data", () => {
  it("Should create a SkData instance from a base64 string", () => {
    const { Skia } = setupSkia();
    const data = Skia.Data.fromBase64("aGVsbG8=") as JsiSkData;
    const ref = Uint8Array.of(
      "h".charCodeAt(0),
      "e".charCodeAt(0),
      "l".charCodeAt(0),
      "l".charCodeAt(0),
      "o".charCodeAt(0)
    );
    expect(data.ref).toEqual(ref);
  });
  it("Should create a SkData instance from a uri", async () => {
    const zurich = resolveFile("skia/__tests__/assets/zurich.jpg");
    const oslo = resolveFile("skia/__tests__/assets/oslo.jpg");
    const { Skia } = importSkia();
    const data = (await Skia.Data.fromURI(
      "skia/__tests__/assets/zurich.jpg"
    )) as JsiSkData;
    expect(data.ref.byteLength).toEqual(zurich.byteLength);
    expect(data.ref.byteLength).not.toEqual(oslo.byteLength);
  });
});
