/*global btoa, atob*/
import { Buffer } from "buffer";

import type { JsiSkData } from "../web/JsiSkData";

import { setupSkia } from "./setup";

declare global {
  function atob(data: string): string;
}

global.atob = (data: string) => Buffer.from(data, "base64").toString();
global.btoa = (data: string) => Buffer.from(data, "ascii").toString("base64");

describe("Data", () => {
  it("Should have atob and btoa working properly", () => {
    expect(btoa("hello")).toBe("aGVsbG8=");
    expect(atob(btoa("hello"))).toBe("hello");
  });
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
});
