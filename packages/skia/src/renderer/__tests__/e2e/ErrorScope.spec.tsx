import { surface, itRunsWithGraphite } from "../setup";

// Ported from react-native-webgpu (ErrorScope.spec.ts). Exercises
// pushErrorScope/popErrorScope validation capture. WebGPU is only available on
// Graphite (Dawn) builds.
describe("Error Scope", () => {
  itRunsWithGraphite(
    "should capture validation error when creating sampler with invalid maxAnisotropy",
    async () => {
      const result = await surface.eval((Skia) => {
        const device = Skia.getDevice();
        device.pushErrorScope("validation");
        device.createSampler({
          maxAnisotropy: 0, // Invalid, maxAnisotropy must be at least 1.
        });
        return device.popErrorScope().then((error) => {
          if (error) {
            return {
              hasError: true,
              messageLength: error.message.length,
              messageNotEmpty: error.message.length > 0,
            };
          }
          return { hasError: false, messageLength: 0, messageNotEmpty: false };
        });
      });

      expect(result.hasError).toBe(true);
      expect(result.messageNotEmpty).toBe(true);
      expect(result.messageLength).toBeGreaterThan(0);
    }
  );

  itRunsWithGraphite(
    "should capture and return error messages from popErrorScope",
    async () => {
      const result = await surface.eval((Skia) => {
        const device = Skia.getDevice();
        // Invalid WGSL shader with syntax error (missing closing parenthesis)
        const invalidShaderWGSL = `@fragment
  fn main() -> @location(0) vec4f {
    return vec4(1.0, 0.0, 0.0, 1.0;
  }`;
        device.pushErrorScope("validation");
        device.createShaderModule({ code: invalidShaderWGSL });
        return device.popErrorScope().then((error) => {
          if (error) {
            return {
              hasError: true,
              messageLength: error.message.length,
              messageNotEmpty: error.message.length > 0,
              messageContainsExpected:
                error.message.includes("expected") ||
                error.message.includes("error") ||
                error.message.includes("parsing"),
            };
          }
          return {
            hasError: false,
            messageLength: 0,
            messageNotEmpty: false,
            messageContainsExpected: false,
          };
        });
      });
      expect(result.hasError).toBe(true);
      expect(result.messageNotEmpty).toBe(true);
      expect(result.messageLength).toBeGreaterThan(0);
      expect(result.messageContainsExpected).toBe(true);
    }
  );

  itRunsWithGraphite("should return null when no error occurs", async () => {
    const result = await surface.eval((Skia) => {
      const device = Skia.getDevice();
      const validShaderWGSL = `@fragment
  fn main() -> @location(0) vec4f {
    return vec4(1.0, 0.0, 0.0, 1.0);
  }`;
      device.pushErrorScope("validation");
      // This should not generate any errors
      device.createShaderModule({ code: validShaderWGSL });
      return device.popErrorScope().then((error) => ({
        hasError: error !== null,
      }));
    });
    expect(result.hasError).toBe(false);
  });
});
