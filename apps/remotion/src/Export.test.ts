import { execSync } from "child_process";
import { readdirSync, existsSync } from "fs";

describe("Export Tests", () => {
  test("PNG files should not contain transparent pixels", () => {
    const stillsDir = "stills";
    
    if (!existsSync(stillsDir)) {
      throw new Error("stills directory not found. Run 'yarn build:sequence' first.");
    }

    const pngFiles = readdirSync(stillsDir).filter(file => file.endsWith(".png"));
    
    expect(pngFiles.length).toBeGreaterThan(0);

    for (const pngFile of pngFiles) {
      const filePath = `${stillsDir}/${pngFile}`;
      
      // Check PNG header for color type (should be RGB without alpha)
      const hexOutput = execSync(`hexdump -C "${filePath}" | head -2`, { 
        encoding: "utf8" 
      });
      
      // Extract color type from PNG IHDR chunk (position 25 in hex dump)
      const colorTypeMatch = hexOutput.match(/08 0([0-6])/);
      expect(colorTypeMatch).toBeTruthy();
      
      const colorType = parseInt(colorTypeMatch![1]);
      
      // Color type should be 2 (RGB) or 0 (grayscale), not 4 (grayscale+alpha) or 6 (RGBA)
      expect([0, 2, 3]).toContain(colorType);
      expect([4, 6]).not.toContain(colorType);
    }
  });
});