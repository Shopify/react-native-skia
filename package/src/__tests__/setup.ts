import path from "path";
import fs from "fs";

import { PNG } from "pngjs";
import pixelmatch from "pixelmatch";
import type { Surface } from "canvaskit-wasm";

import type { SkSurface, SkImage } from "../skia/types";
import { JsiSkSurface } from "../skia/web/JsiSkSurface";

export const E2E = process.env.E2E === "true";
export const itFailsE2e = E2E ? it.failing : it;
export const itRunsE2eOnly = E2E ? it : it.skip;

export const docPath = (relPath: string) =>
  path.resolve(process.cwd(), `../docs/static/img/${relPath}`);

export const processResult = (
  surface: SkSurface,
  relPath: string,
  overwrite = false
) => {
  const ckSurface = JsiSkSurface.fromValue<Surface>(surface);
  ckSurface.flush();
  const image = surface.makeImageSnapshot();
  const png = image.encodeToBytes();
  const p = path.resolve(__dirname, relPath);
  if (fs.existsSync(p) && !overwrite) {
    const ref = fs.readFileSync(p);
    expect(ref.equals(png)).toBe(true);
  } else {
    fs.writeFileSync(p, png);
  }
  ckSurface.getCanvas().clear(Float32Array.of(0, 0, 0, 0));
};

export const checkImage = (
  image: SkImage,
  relPath: string,
  overwrite = false,
  mute = false,
  threshold = 0.1
) => {
  const png = image.encodeToBytes();
  const p = path.resolve(__dirname, relPath);
  if (fs.existsSync(p) && !overwrite) {
    const ref = fs.readFileSync(p);
    const baseline = PNG.sync.read(ref);
    const toTest = PNG.sync.read(Buffer.from(image.encodeToBytes()));
    const diffImage = new PNG({
      width: baseline.width,
      height: baseline.height,
    });
    const diffPixelsCount = pixelmatch(
      baseline.data,
      toTest.data,
      diffImage.data,
      baseline.width,
      baseline.height,
      { threshold }
    );
    if (!mute) {
      if (diffPixelsCount !== 0) {
        fs.writeFileSync(`${p}-result-test.png`, PNG.sync.write(toTest));
        fs.writeFileSync(`${p}-diff-test.png`, PNG.sync.write(diffImage));
      }
      expect(diffPixelsCount).toBe(0);
    }
    return diffPixelsCount;
  } else {
    fs.writeFileSync(p, png);
  }
  return 0;
};
