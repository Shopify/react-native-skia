import { surface, itRunsWithGraphite } from "../setup";

// Ported from react-native-webgpu (ExternalTexture.spec.ts), adapted to Skia.
// Exercises queue.copyExternalImageToTexture: decode an image via
// createImageBitmap, upload it into a GPUTexture, then either sample it through
// a textured quad or read the texture back directly. Self-validating via pixel
// readback (no snapshot assets). WebGPU is only available on Graphite (Dawn)
// builds; createImageBitmap is a native binding that may be unbound.

const TEXTURED_QUAD_SHADER = /* wgsl */ `
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

  @group(0) @binding(0) var srcSampler: sampler;
  @group(0) @binding(1) var srcTex: texture_2d<f32>;

  @fragment fn fs(in: VsOut) -> @location(0) vec4f {
    return textureSample(srcTex, srcSampler, in.uv);
  }
`;

const isCreateImageBitmapBound = () =>
  surface.eval(() => typeof createImageBitmap === "function");

describe("External Textures", () => {
  itRunsWithGraphite(
    "uploads an ImageBitmap with copyExternalImageToTexture and samples it",
    async () => {
      if (!(await isCreateImageBitmapBound())) {
        console.warn("createImageBitmap is not bound — skipping");
        return;
      }
      const result = await surface.eval(
        (Skia, { shader }) => {
          const SIZE = 64;
          // Encode a solid-blue image, then decode it as an ImageBitmap.
          const offscreen = Skia.Surface.MakeOffscreen(SIZE, SIZE)!;
          offscreen.getCanvas().drawColor(Skia.Color("blue"));
          offscreen.flush();
          const png = offscreen.makeImageSnapshot().encodeToBytes();

          const device = Skia.getDevice();
          return createImageBitmap(
            png.buffer as unknown as ImageBitmapSource
          ).then((bitmap) => {
            const format: GPUTextureFormat = "rgba8unorm";
            const texture = device.createTexture({
              size: [bitmap.width, bitmap.height],
              format,
              usage:
                GPUTextureUsage.TEXTURE_BINDING |
                GPUTextureUsage.COPY_DST |
                GPUTextureUsage.RENDER_ATTACHMENT,
            });
            device.queue.copyExternalImageToTexture(
              { source: bitmap },
              { texture },
              { width: bitmap.width, height: bitmap.height }
            );

            const module = device.createShaderModule({ code: shader });
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
                { binding: 0, resource: sampler },
                { binding: 1, resource: texture.createView() },
              ],
            });

            const target = device.createTexture({
              size: [SIZE, SIZE],
              format,
              usage:
                GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_SRC,
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

            return readBuffer.mapAsync(GPUMapMode.READ).then(() => {
              const pixels = new Uint8Array(
                readBuffer.getMappedRange().slice(0)
              );
              readBuffer.unmap();
              bitmap.close();
              const offset =
                (Math.floor(SIZE / 2) * SIZE + Math.floor(SIZE / 2)) * 4;
              return [
                pixels[offset],
                pixels[offset + 1],
                pixels[offset + 2],
                pixels[offset + 3],
              ];
            });
          });
        },
        { shader: TEXTURED_QUAD_SHADER }
      );
      const [r, g, b, a] = result;
      // Sampled the solid-blue uploaded image.
      expect(b).toBeGreaterThan(200);
      expect(r).toBeLessThan(60);
      expect(g).toBeLessThan(60);
      expect(a).toBeGreaterThan(200);
    }
  );

  itRunsWithGraphite(
    "copyExternalImageToTexture flipY uploads rows bottom-up",
    async () => {
      if (!(await isCreateImageBitmapBound())) {
        console.warn("createImageBitmap is not bound — skipping");
        return;
      }
      const result = await surface.eval((Skia) => {
        const SIZE = 64;
        // Top half red, bottom half blue.
        const offscreen = Skia.Surface.MakeOffscreen(SIZE, SIZE)!;
        const canvas = offscreen.getCanvas();
        const paint = Skia.Paint();
        paint.setColor(Skia.Color("red"));
        canvas.drawRect(Skia.XYWHRect(0, 0, SIZE, SIZE / 2), paint);
        paint.setColor(Skia.Color("blue"));
        canvas.drawRect(Skia.XYWHRect(0, SIZE / 2, SIZE, SIZE / 2), paint);
        offscreen.flush();
        const png = offscreen.makeImageSnapshot().encodeToBytes();

        const device = Skia.getDevice();
        return createImageBitmap(
          png.buffer as unknown as ImageBitmapSource
        ).then((bitmap) => {
          const format: GPUTextureFormat = "rgba8unorm";
          const texture = device.createTexture({
            size: [bitmap.width, bitmap.height],
            format,
            usage: GPUTextureUsage.COPY_DST | GPUTextureUsage.COPY_SRC,
          });
          // flipY: source row 0 (top, red) ends up at the bottom of the
          // texture, so the texture's top row is the source's bottom (blue).
          device.queue.copyExternalImageToTexture(
            { source: bitmap, flipY: true },
            { texture },
            { width: bitmap.width, height: bitmap.height }
          );

          const bytesPerRow = SIZE * 4;
          const readBuffer = device.createBuffer({
            size: bytesPerRow * SIZE,
            usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
          });
          const encoder = device.createCommandEncoder();
          encoder.copyTextureToBuffer(
            { texture },
            { buffer: readBuffer, bytesPerRow },
            { width: SIZE, height: SIZE }
          );
          device.queue.submit([encoder.finish()]);

          return readBuffer.mapAsync(GPUMapMode.READ).then(() => {
            const pixels = new Uint8Array(readBuffer.getMappedRange().slice(0));
            readBuffer.unmap();
            bitmap.close();
            // Column center, top row (y=2) and bottom row (y=SIZE-2).
            const cx = Math.floor(SIZE / 2);
            const top = (2 * SIZE + cx) * 4;
            const bottom = ((SIZE - 2) * SIZE + cx) * 4;
            return {
              top: [pixels[top], pixels[top + 1], pixels[top + 2]],
              bottom: [pixels[bottom], pixels[bottom + 1], pixels[bottom + 2]],
            };
          });
        });
      });
      // After flipY, the texture top row is blue and the bottom row is red.
      expect(result.top[2]).toBeGreaterThan(200); // blue
      expect(result.top[0]).toBeLessThan(60);
      expect(result.bottom[0]).toBeGreaterThan(200); // red
      expect(result.bottom[2]).toBeLessThan(60);
    }
  );
});
