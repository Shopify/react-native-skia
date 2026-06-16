import { surface, itRunsWithGraphite } from "../setup";

// Ported from react-native-webgpu (ImportExternalTexture.spec.ts), adapted to
// Skia's NativeBuffer API as the external-texture source (Skia has no
// VideoFrame). Draws a known solid color into an SkImage, wraps it as a native
// buffer (CVPixelBufferRef / AHardwareBuffer), imports it as a
// GPUExternalTexture, samples it through a render pass, reads the result back,
// and checks the sampled color matches. WebGPU is only available on Graphite
// (Dawn) builds.

// NativeBuffer is iOS/Android only, and unavailable on the API-21 Fabric
// Android emulator (mirrors NativeBuffer.spec.tsx's shouldNativeBufferTestRun).
const supportsNativeBuffer = () => {
  if (surface.OS !== "ios" && surface.OS !== "android") {
    return false;
  }
  if (surface.arch === "fabric" && surface.OS === "android") {
    return false;
  }
  return true;
};

describe("ImportExternalTexture", () => {
  itRunsWithGraphite(
    "imports a NativeBuffer as an external texture and samples it",
    async () => {
      if (!supportsNativeBuffer()) {
        return;
      }
      const result = await surface.eval((Skia) => {
        const SIZE = 64;

        // 1. Draw a solid red image and wrap it as a native buffer.
        const offscreen = Skia.Surface.MakeOffscreen(SIZE, SIZE)!;
        const canvas = offscreen.getCanvas();
        canvas.drawColor(Skia.Color("red"));
        offscreen.flush();
        const image = offscreen.makeImageSnapshot();
        const nativeBuffer = Skia.NativeBuffer.MakeFromImage(image);

        const device = Skia.getDevice();
        try {
          // 2. Import it. The GPUExternalTexture owns the shared-memory access
          // window; there is no createTexture / beginAccess to manage.
          // Skia's binding accepts the native buffer pointer as `source` (see
          // the SkiaGPUExternalTextureDescriptor overload it adds to GPUDevice).
          const externalTexture = device.importExternalTexture({
            source: nativeBuffer,
            label: "test-frame",
          });

          // 3. Sample the external texture into a render target.
          const module = device.createShaderModule({
            code: /* wgsl */ `
              struct VsOut {
                @builtin(position) position: vec4f,
                @location(0) uv: vec2f,
              };

              @vertex fn vs(@builtin(vertex_index) vid: u32) -> VsOut {
                var positions = array<vec2f, 3>(
                  vec2f(-1.0, -3.0),
                  vec2f(-1.0,  1.0),
                  vec2f( 3.0,  1.0),
                );
                var uvs = array<vec2f, 3>(
                  vec2f(0.0, 2.0),
                  vec2f(0.0, 0.0),
                  vec2f(2.0, 0.0),
                );
                var out: VsOut;
                out.position = vec4f(positions[vid], 0.0, 1.0);
                out.uv = uvs[vid];
                return out;
              }

              @group(0) @binding(0) var srcTex: texture_external;
              @group(0) @binding(1) var srcSampler: sampler;

              @fragment fn fs(in: VsOut) -> @location(0) vec4f {
                return textureSampleBaseClampToEdge(srcTex, srcSampler, in.uv);
              }
            `,
          });
          const format: GPUTextureFormat = "rgba8unorm";
          const pipeline = device.createRenderPipeline({
            layout: "auto",
            vertex: { module, entryPoint: "vs" },
            fragment: { module, entryPoint: "fs", targets: [{ format }] },
            primitive: { topology: "triangle-list" },
          });
          const sampler = device.createSampler({
            magFilter: "linear",
            minFilter: "linear",
          });
          const bindGroup = device.createBindGroup({
            layout: pipeline.getBindGroupLayout(0),
            entries: [
              { binding: 0, resource: externalTexture },
              { binding: 1, resource: sampler },
            ],
          });

          const target = device.createTexture({
            size: [SIZE, SIZE],
            format,
            usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_SRC,
          });
          const bytesPerRow = SIZE * 4; // 256, already 256-byte aligned
          const readBuffer = device.createBuffer({
            size: bytesPerRow * SIZE,
            usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
          });

          const encoder = device.createCommandEncoder();
          const pass = encoder.beginRenderPass({
            colorAttachments: [
              {
                view: target.createView(),
                clearValue: { r: 0, g: 0, b: 0, a: 1 },
                loadOp: "clear",
                storeOp: "store",
              },
            ],
          });
          pass.setPipeline(pipeline);
          pass.setBindGroup(0, bindGroup);
          pass.draw(3);
          pass.end();
          encoder.copyTextureToBuffer(
            { texture: target },
            { buffer: readBuffer, bytesPerRow },
            { width: SIZE, height: SIZE }
          );
          device.queue.submit([encoder.finish()]);
          // End the access window now that the sampling work is submitted.
          externalTexture.destroy();

          return readBuffer.mapAsync(GPUMapMode.READ).then(() => {
            const pixels = new Uint8Array(readBuffer.getMappedRange().slice(0));
            readBuffer.unmap();
            // Release the native buffer: all GPU work referencing it is
            // submitted and the pixels have been read back.
            Skia.NativeBuffer.Release(nativeBuffer);
            // Center pixel.
            const offset =
              (Math.floor(SIZE / 2) * SIZE + Math.floor(SIZE / 2)) * 4;
            return [
              pixels[offset],
              pixels[offset + 1],
              pixels[offset + 2],
              pixels[offset + 3],
            ];
          });
        } catch (e) {
          Skia.NativeBuffer.Release(nativeBuffer);
          throw e;
        }
      });
      const [r, g, b, a] = result;
      // Sampled the solid-red source: red high, green/blue low, opaque.
      expect(r).toBeGreaterThan(200);
      expect(g).toBeLessThan(60);
      expect(b).toBeLessThan(60);
      expect(a).toBeGreaterThan(200);
    }
  );

  // A solid color can't catch a broken UV mapping (every texel is the same), so
  // this samples a 4-quadrant image and checks all four distinct colors survive
  // — a collapsed/degenerate transform would repeat or blend them.
  itRunsWithGraphite(
    "preserves the 2D layout of a non-uniform external texture",
    async () => {
      if (!supportsNativeBuffer()) {
        return;
      }
      const result = await surface.eval((Skia) => {
        const SIZE = 64;
        const half = SIZE / 2;
        // Four distinct quadrants: TL red, TR green, BL blue, BR yellow.
        const offscreen = Skia.Surface.MakeOffscreen(SIZE, SIZE)!;
        const canvas = offscreen.getCanvas();
        const paint = Skia.Paint();
        const quadrants: [string, number, number][] = [
          ["red", 0, 0],
          ["lime", half, 0],
          ["blue", 0, half],
          ["yellow", half, half],
        ];
        quadrants.forEach(([color, x, y]) => {
          paint.setColor(Skia.Color(color));
          canvas.drawRect(Skia.XYWHRect(x, y, half, half), paint);
        });
        offscreen.flush();
        const nativeBuffer = Skia.NativeBuffer.MakeFromImage(
          offscreen.makeImageSnapshot()
        );

        const device = Skia.getDevice();
        try {
          const externalTexture = device.importExternalTexture({
            source: nativeBuffer,
            label: "grid-frame",
          });
          const module = device.createShaderModule({
            code: /* wgsl */ `
              struct VsOut {
                @builtin(position) position: vec4f,
                @location(0) uv: vec2f,
              };
              @vertex fn vs(@builtin(vertex_index) vid: u32) -> VsOut {
                var positions = array<vec2f, 3>(
                  vec2f(-1.0, -3.0), vec2f(-1.0, 1.0), vec2f(3.0, 1.0),
                );
                var uvs = array<vec2f, 3>(
                  vec2f(0.0, 2.0), vec2f(0.0, 0.0), vec2f(2.0, 0.0),
                );
                var out: VsOut;
                out.position = vec4f(positions[vid], 0.0, 1.0);
                out.uv = uvs[vid];
                return out;
              }
              @group(0) @binding(0) var srcTex: texture_external;
              @group(0) @binding(1) var srcSampler: sampler;
              @fragment fn fs(in: VsOut) -> @location(0) vec4f {
                return textureSampleBaseClampToEdge(srcTex, srcSampler, in.uv);
              }
            `,
          });
          const format: GPUTextureFormat = "rgba8unorm";
          const pipeline = device.createRenderPipeline({
            layout: "auto",
            vertex: { module, entryPoint: "vs" },
            fragment: { module, entryPoint: "fs", targets: [{ format }] },
            primitive: { topology: "triangle-list" },
          });
          // Nearest filtering so quadrant centers read back as pure colors.
          const sampler = device.createSampler({});
          const bindGroup = device.createBindGroup({
            layout: pipeline.getBindGroupLayout(0),
            entries: [
              { binding: 0, resource: externalTexture },
              { binding: 1, resource: sampler },
            ],
          });

          const target = device.createTexture({
            size: [SIZE, SIZE],
            format,
            usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_SRC,
          });
          const bytesPerRow = SIZE * 4;
          const readBuffer = device.createBuffer({
            size: bytesPerRow * SIZE,
            usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
          });

          const encoder = device.createCommandEncoder();
          const pass = encoder.beginRenderPass({
            colorAttachments: [
              {
                view: target.createView(),
                clearValue: { r: 0, g: 0, b: 0, a: 1 },
                loadOp: "clear",
                storeOp: "store",
              },
            ],
          });
          pass.setPipeline(pipeline);
          pass.setBindGroup(0, bindGroup);
          pass.draw(3);
          pass.end();
          encoder.copyTextureToBuffer(
            { texture: target },
            { buffer: readBuffer, bytesPerRow },
            { width: SIZE, height: SIZE }
          );
          device.queue.submit([encoder.finish()]);
          externalTexture.destroy();

          return readBuffer.mapAsync(GPUMapMode.READ).then(() => {
            const pixels = new Uint8Array(readBuffer.getMappedRange().slice(0));
            readBuffer.unmap();
            Skia.NativeBuffer.Release(nativeBuffer);
            // Sample the center of each rendered quadrant.
            const q = SIZE / 4;
            const at = (x: number, y: number) => {
              const o = (y * SIZE + x) * 4;
              return [pixels[o], pixels[o + 1], pixels[o + 2]];
            };
            return [at(q, q), at(3 * q, q), at(q, 3 * q), at(3 * q, 3 * q)];
          });
        } catch (e) {
          Skia.NativeBuffer.Release(nativeBuffer);
          throw e;
        }
      });
      // Classify each sampled quadrant by dominant channels. Orientation-
      // agnostic: a correct 2D mapping yields the four distinct source colors
      // (in some orientation); a collapse would repeat or blend them.
      const classify = ([r, g, b]: number[]) => {
        if (r > 180 && g > 180 && b < 80) {
          return "yellow";
        }
        if (r > 180 && g < 80 && b < 80) {
          return "red";
        }
        if (r < 80 && g > 180 && b < 80) {
          return "green";
        }
        if (r < 80 && g < 80 && b > 180) {
          return "blue";
        }
        return "other";
      };
      expect(result.map(classify).sort()).toEqual([
        "blue",
        "green",
        "red",
        "yellow",
      ]);
    }
  );
});
