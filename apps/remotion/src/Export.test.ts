import { readdirSync, existsSync } from "fs";

import sharp from "sharp";

describe("Export Tests", () => {
  test("PNG files should not contain transparent pixels", async () => {
    const stillsDir = "stills";

    if (!existsSync(stillsDir)) {
      throw new Error(
        "stills directory not found. Run 'yarn build:sequence' first."
      );
    }

    const pngFiles = readdirSync(stillsDir).filter((file) =>
      file.endsWith(".png")
    );

    expect(pngFiles.length).toBeGreaterThan(0);

    for (const pngFile of pngFiles) {
      const filePath = `${stillsDir}/${pngFile}`;

      // Read the PNG image and get its metadata
      const image = sharp(filePath);
      const metadata = await image.metadata();

      // If we want to be extra sure, we can extract raw pixel data
      // and check for any transparent pixels
      if (metadata.channels === 4) {
        const { data } = await image
          .raw()
          .toBuffer({ resolveWithObject: true });

        let hasTransparency = false;
        // Check every 4th byte (alpha channel) for transparency
        for (let i = 3; i < data.length; i += 4) {
          if (data[i] < 255) {
            hasTransparency = true;
            break;
          }
        }

        expect(hasTransparency).toBe(false);
      }
    }
  });
});
