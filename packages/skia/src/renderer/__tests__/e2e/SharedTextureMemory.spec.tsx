import { surface, itRunsWithGraphite } from "../setup";

// Ported from react-native-webgpu (SharedTextureMemory.spec.ts), adapted to
// Skia's NativeBuffer API as the shared-memory source (Skia has no VideoFrame).
// Draws a known solid color into an SkImage, wraps it as a native buffer
// (CVPixelBufferRef / AHardwareBuffer), imports it via
// device.importSharedTextureMemory, creates a texture aliasing it, samples it
// through a textured quad, reads the result back, and checks the sampled color.
// WebGPU is only available on Graphite (Dawn) builds, and NativeBuffer only on
// iOS/Android (not on the API-21 Fabric Android emulator).

const SHARED_TEXTURE_SHADER = /* wgsl */ `
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

  @group(0) @binding(0) var srcTex: texture_2d<f32>;
  @group(0) @binding(1) var srcSampler: sampler;

  @fragment fn fs(in: VsOut) -> @location(0) vec4f {
    return textureSample(srcTex, srcSampler, in.uv);
  }
`;

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

describe("SharedTextureMemory", () => {
  itRunsWithGraphite(
    "imports a NativeBuffer and samples it through a textured quad",
    async () => {
      if (!supportsNativeBuffer()) {
        return;
      }
      const result = await surface.eval(
        (Skia, { shader }) => {
          const SIZE = 64;
          const offscreen = Skia.Surface.MakeOffscreen(SIZE, SIZE)!;
          offscreen.getCanvas().drawColor(Skia.Color("red"));
          offscreen.flush();
          const nativeBuffer = Skia.NativeBuffer.MakeFromImage(
            offscreen.makeImageSnapshot()
          );

          const device = Skia.getDevice();
          try {
            // importSharedTextureMemory is a Skia-only binding, not in
            // @webgpu/types, so cast the device to reach it.
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const memory = (device as any).importSharedTextureMemory({
              handle: nativeBuffer,
              label: "test-frame",
            });
            const texture = memory.createTexture();
            if (!memory.beginAccess(texture, true)) {
              throw new Error("beginAccess returned false");
            }

            const module = device.createShaderModule({ code: shader });
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
                { binding: 0, resource: texture.createView() },
                { binding: 1, resource: sampler },
              ],
            });

            const target = device.createTexture({
              size: [SIZE, SIZE],
              format,
              usage:
                GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_SRC,
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

            return readBuffer.mapAsync(GPUMapMode.READ).then(() => {
              const pixels = new Uint8Array(
                readBuffer.getMappedRange().slice(0)
              );
              readBuffer.unmap();
              memory.endAccess(texture);
              texture.destroy();
              Skia.NativeBuffer.Release(nativeBuffer);
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
        },
        { shader: SHARED_TEXTURE_SHADER }
      );
      const [r, g, b, a] = result;
      // Sampled the solid-red source.
      expect(r).toBeGreaterThan(200);
      expect(g).toBeLessThan(60);
      expect(b).toBeLessThan(60);
      expect(a).toBeGreaterThan(200);
    }
  );

  // Same as above, but with an *explicit* bind group layout
  // (createBindGroupLayout + createPipelineLayout) instead of layout: "auto".
  // This exercises the native BindGroupLayoutEntry conversion path, which
  // "auto" layouts bypass entirely.
  itRunsWithGraphite(
    "samples a shared texture through an explicit bind group layout",
    async () => {
      if (!supportsNativeBuffer()) {
        return;
      }
      const result = await surface.eval(
        (Skia, { shader }) => {
          const SIZE = 64;
          const offscreen = Skia.Surface.MakeOffscreen(SIZE, SIZE)!;
          offscreen.getCanvas().drawColor(Skia.Color("lime"));
          offscreen.flush();
          const nativeBuffer = Skia.NativeBuffer.MakeFromImage(
            offscreen.makeImageSnapshot()
          );

          const device = Skia.getDevice();
          try {
            // importSharedTextureMemory is a Skia-only binding, not in
            // @webgpu/types, so cast the device to reach it.
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const memory = (device as any).importSharedTextureMemory({
              handle: nativeBuffer,
              label: "test-frame",
            });
            const texture = memory.createTexture();
            if (!memory.beginAccess(texture, true)) {
              throw new Error("beginAccess returned false");
            }

            const module = device.createShaderModule({ code: shader });
            const format: GPUTextureFormat = "rgba8unorm";
            const bindGroupLayout = device.createBindGroupLayout({
              entries: [
                {
                  binding: 0,
                  visibility: GPUShaderStage.FRAGMENT,
                  texture: {},
                },
                {
                  binding: 1,
                  visibility: GPUShaderStage.FRAGMENT,
                  sampler: {},
                },
              ],
            });
            const pipeline = device.createRenderPipeline({
              layout: device.createPipelineLayout({
                bindGroupLayouts: [bindGroupLayout],
              }),
              vertex: { module, entryPoint: "vs" },
              fragment: { module, entryPoint: "fs", targets: [{ format }] },
              primitive: { topology: "triangle-list" },
            });
            const sampler = device.createSampler({
              magFilter: "linear",
              minFilter: "linear",
            });
            const bindGroup = device.createBindGroup({
              layout: bindGroupLayout,
              entries: [
                { binding: 0, resource: texture.createView() },
                { binding: 1, resource: sampler },
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
              memory.endAccess(texture);
              texture.destroy();
              Skia.NativeBuffer.Release(nativeBuffer);
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
        },
        { shader: SHARED_TEXTURE_SHADER }
      );
      const [r, g, b, a] = result;
      // Sampled the solid-green ("lime") source.
      expect(g).toBeGreaterThan(200);
      expect(r).toBeLessThan(60);
      expect(b).toBeLessThan(60);
      expect(a).toBeGreaterThan(200);
    }
  );
});
