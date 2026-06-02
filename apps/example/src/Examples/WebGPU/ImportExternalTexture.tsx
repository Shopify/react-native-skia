import React, { useEffect, useRef } from "react";
import { StyleSheet, View, Text } from "react-native";
import type { WebGPUCanvasRef, NativeBuffer } from "@shopify/react-native-skia";
import { WebGPUCanvas, Skia } from "@shopify/react-native-skia";

// Plays a video through GPUDevice.importExternalTexture (Skia port of
// react-native-webgpu's ImportExternalTexture demo). Each decoded frame is an
// SkImage; we wrap it as a platform NativeBuffer (CVPixelBufferRef on iOS,
// AHardwareBuffer on Android) and import it as a GPUExternalTexture — no manual
// createTexture/beginAccess. A GPUExternalTexture expires once the queue work
// that used it is submitted, so we re-import one every frame.
const videoURL = "https://bit.ly/skia-video";

const SHADER = /* wgsl */ `
struct VsOut {
  @builtin(position) position: vec4f,
  @location(0) uv: vec2f,
};

// Per-axis scale applied to UVs around the center so the canvas samples a
// sub-rectangle of the video matching the canvas aspect ratio ('cover' fit).
struct Uniforms { uvScale: vec2f };

@group(0) @binding(0) var srcTex: texture_external;
@group(0) @binding(1) var srcSampler: sampler;
@group(0) @binding(2) var<uniform> u: Uniforms;

@vertex
fn vs_main(@builtin(vertex_index) vid: u32) -> VsOut {
  // Full-screen triangle.
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

@fragment
fn fs_main(in: VsOut) -> @location(0) vec4f {
  let uv = vec2f(0.5) + (in.uv - vec2f(0.5)) * u.uvScale;
  // External textures must be sampled with textureSampleBaseClampToEdge.
  let color = textureSampleBaseClampToEdge(srcTex, srcSampler, uv);
  // Video frames are opaque but their BGRA surface often has a 0 alpha channel;
  // force alpha to 1 so the premultiplied canvas isn't composited transparent
  // (which shows through as a black screen).
  return vec4f(color.rgb, 1.0);
}
`;

export function ImportExternalTexture() {
  const canvasRef = useRef<WebGPUCanvasRef>(null);
  const animationRef = useRef<number>(0);
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      if (!canvasRef.current || typeof RNWebGPU === "undefined") {
        return;
      }
      const ctx = canvasRef.current.getContext("webgpu");
      if (!ctx) {
        return;
      }

      const device = Skia.getDevice();
      const canvas = ctx.canvas as unknown as { width: number; height: number };
      const format = navigator.gpu.getPreferredCanvasFormat();
      ctx.configure({ device, format, alphaMode: "premultiplied" });

      const video = await Skia.Video(videoURL);
      if (cancelled) {
        return;
      }
      video.setLooping(true);
      video.play();

      const module = device.createShaderModule({ code: SHADER });
      const pipeline = device.createRenderPipeline({
        layout: "auto",
        vertex: { module, entryPoint: "vs_main" },
        fragment: { module, entryPoint: "fs_main", targets: [{ format }] },
        primitive: { topology: "triangle-list" },
      });
      const sampler = device.createSampler({
        magFilter: "linear",
        minFilter: "linear",
      });
      // vec2<f32> padded to the 16-byte uniform alignment.
      const uniformBuffer = device.createBuffer({
        size: 16,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
      });

      // 'cover' fit: scale UVs around their center so the longer axis of the
      // video is cropped to match the canvas aspect ratio.
      const computeUvScale = (texW: number, texH: number): [number, number] => {
        if (!canvas.width || !canvas.height) {
          return [1, 1];
        }
        const canvasAR = canvas.width / canvas.height;
        const texAR = texW / texH;
        return texAR > canvasAR ? [canvasAR / texAR, 1] : [1, texAR / canvasAR];
      };

      // Hold the current frame's native buffer across ticks. We release the
      // previous one only when a new frame arrives — by then last tick's GPU
      // work that sampled it has been submitted (and is a frame old).
      let currentBuffer: NativeBuffer | null = null;
      let lastDims: [number, number] | null = null;

      const render = () => {
        if (cancelled) {
          return;
        }
        const frame = video.nextImage();
        if (frame) {
          if (currentBuffer) {
            Skia.NativeBuffer.Release(currentBuffer);
          }
          currentBuffer = Skia.NativeBuffer.MakeFromImage(frame);
          const w = frame.width();
          const h = frame.height();
          if (!lastDims || lastDims[0] !== w || lastDims[1] !== h) {
            const [sx, sy] = computeUvScale(w, h);
            device.queue.writeBuffer(
              uniformBuffer,
              0,
              new Float32Array([sx, sy])
            );
            lastDims = [w, h];
          }
        }

        const encoder = device.createCommandEncoder();
        const pass = encoder.beginRenderPass({
          colorAttachments: [
            {
              view: ctx.getCurrentTexture().createView(),
              clearValue: { r: 0, g: 0, b: 0, a: 1 },
              loadOp: "clear",
              storeOp: "store",
            },
          ],
        });

        // Re-import the latest frame each tick (external textures expire after
        // submit).
        let externalTexture: GPUExternalTexture | null = null;
        if (currentBuffer) {
          try {
            externalTexture = device.importExternalTexture({
              source: currentBuffer,
              label: "video-frame",
            });
          } catch (e) {
            console.warn("[ImportExternalTexture] import failed:", e);
          }
          if (externalTexture) {
            const bindGroup = device.createBindGroup({
              layout: pipeline.getBindGroupLayout(0),
              entries: [
                { binding: 0, resource: externalTexture },
                { binding: 1, resource: sampler },
                { binding: 2, resource: { buffer: uniformBuffer } },
              ],
            });
            pass.setPipeline(pipeline);
            pass.setBindGroup(0, bindGroup);
            pass.draw(3);
          }
        }

        pass.end();
        device.queue.submit([encoder.finish()]);
        // End the access window now that the sampling work is submitted, so the
        // frame's surface is released promptly instead of at GC.
        externalTexture?.destroy();
        ctx.present();
        animationRef.current = requestAnimationFrame(render);
      };
      animationRef.current = requestAnimationFrame(render);

      cleanupRef.current = () => {
        cancelAnimationFrame(animationRef.current);
        if (currentBuffer) {
          Skia.NativeBuffer.Release(currentBuffer);
          currentBuffer = null;
        }
        uniformBuffer.destroy();
        video.pause();
      };
    };

    init();

    return () => {
      cancelled = true;
      cleanupRef.current?.();
    };
  }, []);

  if (typeof RNWebGPU === "undefined") {
    return (
      <View style={styles.container}>
        <View style={styles.messageContainer}>
          <Text style={styles.message}>
            External textures require SK_GRAPHITE to be enabled.
          </Text>
          <Text style={styles.submessage}>
            Build react-native-skia with Graphite support to use this feature.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <WebGPUCanvas ref={canvasRef} style={styles.canvas} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a1a1a",
  },
  canvas: {
    flex: 1,
  },
  messageContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  message: {
    color: "#fff",
    fontSize: 18,
    textAlign: "center",
    marginBottom: 10,
  },
  submessage: {
    color: "#888",
    fontSize: 14,
    textAlign: "center",
  },
});
