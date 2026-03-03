import { surface } from "../setup";

describe("Skia.Color", () => {
  it("should convert regular array to Float32Array", async () => {
    const result = await surface.eval((Skia) => {
      const color = Skia.Color([1, 0, 0, 1]); // Red
      return Array.from(color);
    });
    expect(result[0]).toBeCloseTo(1);
    expect(result[1]).toBeCloseTo(0);
    expect(result[2]).toBeCloseTo(0);
    expect(result[3]).toBeCloseTo(1);
  });

  it("should handle CSS color names", async () => {
    const result = await surface.eval((Skia) => {
      const color = Skia.Color("cyan");
      return Array.from(color);
    });
    expect(result[0]).toBeCloseTo(0); // R
    expect(result[1]).toBeCloseTo(1); // G
    expect(result[2]).toBeCloseTo(1); // B
    expect(result[3]).toBeCloseTo(1); // A
  });

  it("should handle hex colors", async () => {
    const result = await surface.eval((Skia) => {
      const color = Skia.Color("#ff0000");
      return Array.from(color);
    });
    expect(result[0]).toBeCloseTo(1);
    expect(result[1]).toBeCloseTo(0);
    expect(result[2]).toBeCloseTo(0);
  });

  it("should handle hex colors with alpha", async () => {
    const result = await surface.eval((Skia) => {
      const color = Skia.Color("#ff000080");
      return Array.from(color);
    });
    expect(result[0]).toBeCloseTo(1);
    expect(result[3]).toBeCloseTo(0.5, 1); // ~128/255
  });

  it("should work with paint.setColor using array", async () => {
    // This should not throw
    const result = await surface.eval((Skia) => {
      const paint = Skia.Paint();
      paint.setColor(Skia.Color([1, 0, 0, 1]));
      return true;
    });
    expect(result).toBe(true);
  });

  it("should work in createPicture callback", async () => {
    // This tests the original bug from issue #2200
    const result = await surface.eval((Skia) => {
      const recorder = Skia.PictureRecorder();
      const canvas = recorder.beginRecording({
        x: 0,
        y: 0,
        width: 100,
        height: 100,
      });
      const paint = Skia.Paint();
      paint.setColor(Skia.Color("cyan"));
      canvas.drawCircle(50, 50, 25, paint);
      const picture = recorder.finishRecordingAsPicture();
      return picture !== null;
    });
    expect(result).toBe(true);
  });

  it("should handle array colors in createPicture callback", async () => {
    // This tests the specific scenario from issue #2200 with array colors
    const result = await surface.eval((Skia) => {
      const recorder = Skia.PictureRecorder();
      const canvas = recorder.beginRecording({
        x: 0,
        y: 0,
        width: 100,
        height: 100,
      });
      const paint = Skia.Paint();
      // Use array color like in the original bug report
      paint.setColor(Skia.Color([0, 1, 1, 1])); // cyan as array
      canvas.drawCircle(50, 50, 25, paint);
      const picture = recorder.finishRecordingAsPicture();
      return picture !== null;
    });
    expect(result).toBe(true);
  });

  it("should pass through Float32Array unchanged", async () => {
    const result = await surface.eval((Skia) => {
      const input = Float32Array.of(0.5, 0.5, 0.5, 1);
      const color = Skia.Color(input);
      // Check that values are preserved
      return Array.from(color);
    });
    expect(result[0]).toBeCloseTo(0.5);
    expect(result[1]).toBeCloseTo(0.5);
    expect(result[2]).toBeCloseTo(0.5);
    expect(result[3]).toBeCloseTo(1);
  });
});
