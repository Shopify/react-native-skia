import { importSkia, surface } from "../setup";

describe("Data Encoding", () => {
  it("encodeToBytes()", async () => {
    const result = await surface.eval((Skia) => {
      const data = Skia.Data.fromBase64(
        "R0lGODlhAQABAIAAAGGqHwAAACH5BAAAAAAALAAAAAABAAEAAAICRAEAOw=="
      );
      const img = Skia.Image.MakeImageFromEncoded(data);
      if (!img) {
        return [];
      }
      return Array.from(img.encodeToBytes());
    });
    const { Skia } = importSkia();
    const data = Skia.Data.fromBase64(
      "R0lGODlhAQABAIAAAGGqHwAAACH5BAAAAAAALAAAAAABAAEAAAICRAEAOw=="
    );
    const img = Skia.Image.MakeImageFromEncoded(data)!;
    expect(img).toBeTruthy();
    expect(result).toEqual(Array.from(img.encodeToBytes()));
  });
  it("encodeToBase64()", async () => {
    const result = await surface.eval((Skia) => {
      const data = Skia.Data.fromBase64(
        "R0lGODlhAQABAIAAAGGqHwAAACH5BAAAAAAALAAAAAABAAEAAAICRAEAOw=="
      );
      const img = Skia.Image.MakeImageFromEncoded(data);
      if (!img) {
        return "";
      }
      return img.encodeToBase64();
    });
    const { Skia } = importSkia();

    const data = Skia.Data.fromBase64(
      "R0lGODlhAQABAIAAAGGqHwAAACH5BAAAAAAALAAAAAABAAEAAAICRAEAOw=="
    );
    const img = Skia.Image.MakeImageFromEncoded(data)!;
    expect(img).toBeTruthy();
    expect(result).toEqual(img.encodeToBase64());
  });
});
