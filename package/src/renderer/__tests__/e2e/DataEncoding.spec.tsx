import { importSkia, surface } from "../setup";

describe("Data Encoding", () => {
  it("encodeToBytes() from CPU image", async () => {
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
  it("encodeToBase64() from CPU image", async () => {
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
  it("encodeToBytes() from GPU image", async () => {
    const result = await surface.eval((Skia) => {
      const data = Skia.Data.fromBase64(
        "R0lGODlhAQABAIAAAGGqHwAAACH5BAAAAAAALAAAAAABAAEAAAICRAEAOw=="
      );
      const img = Skia.Image.MakeImageFromEncoded(data);
      if (!img) {
        return [];
      }
      const offscreen = Skia.Surface.MakeOffscreen(1, 1)!;
      const canvas = offscreen.getCanvas();
      canvas.drawImage(img, 0, 0);
      return Array.from(offscreen.makeImageSnapshot().encodeToBytes());
    });
    expect(result.length).toBeGreaterThan(0);
  });
  it("encodeToBase64() from GPU image", async () => {
    const result = await surface.eval((Skia) => {
      const data = Skia.Data.fromBase64(
        "R0lGODlhAQABAIAAAGGqHwAAACH5BAAAAAAALAAAAAABAAEAAAICRAEAOw=="
      );
      const img = Skia.Image.MakeImageFromEncoded(data);
      if (!img) {
        return "";
      }
      const offscreen = Skia.Surface.MakeOffscreen(1, 1)!;
      const canvas = offscreen.getCanvas();
      canvas.drawImage(img, 0, 0);
      return offscreen.makeImageSnapshot().encodeToBase64();
    });
    expect(result.length).toBeGreaterThan(0);
  });
});
