import React, { useEffect, useRef } from "react";
import { StyleSheet, View, Text } from "react-native";
import type { WebGPUCanvasRef, NativeBuffer } from "@shopify/react-native-skia";
import { WebGPUCanvas, Skia } from "@shopify/react-native-skia";

// This example draws an image with Skia (a 2x2 color grid + a white disc),
// wraps it as a platform NativeBuffer (CVPixelBufferRef on iOS,
// AHardwareBuffer on Android) and imports it directly into WebGPU as a
// GPUExternalTexture — no CPU copy. The texture is then sampled through a
// `texture_external` binding onto a full-screen quad.
//
// It also cycles the Skia-only `rotation` / `mirrored` descriptor fields so you
// can see those sampling transforms applied each step.

const SOURCE_SIZE = 512;

const shader = /* wgsl */ `
struct VsOut {
  @builtin(position) position: vec4f,
  @location(0) uv: vec2f,
};

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

@group(0) @binding(0) var srcTex: texture_external;
@group(0) @binding(1) var srcSampler: sampler;

@fragment
fn fs_main(in: VsOut) -> @location(0) vec4f {
  // External textures must be sampled with textureSampleBaseClampToEdge.
  return textureSampleBaseClampToEdge(srcTex, srcSampler, in.uv);
}
`;

// Draw a recognizable, asymmetric image with Skia so the rotation / mirror
// transforms are easy to read.
const makeSourceImage = () => {
  const surface = Skia.Surface.MakeOffscreen(SOURCE_SIZE, SOURCE_SIZE)!;
  const canvas = surface.getCanvas();
  const paint = Skia.Paint();
  const half = SOURCE_SIZE / 2;
  const quadrants: [string, number, number][] = [
    ["#e74c3c", 0, 0], // top-left  red
    ["#2ecc71", half, 0], // top-right green
    ["#3498db", 0, half], // bottom-left blue
    ["#f1c40f", half, half], // bottom-right yellow
  ];
  quadrants.forEach(([color, x, y]) => {
    paint.setColor(Skia.Color(color));
    canvas.drawRect(Skia.XYWHRect(x, y, half, half), paint);
  });
  paint.setColor(Skia.Color("white"));
  canvas.drawCircle(half, half, half * 0.4, paint);
  surface.flush();
  return surface.makeImageSnapshot();
};

export function ImportExternalTexture() {
  const canvasRef = useRef<WebGPUCanvasRef>(null);
  const animationRef = useRef<number>(0);
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (!canvasRef.current) {
        return;
      }
      if (typeof RNWebGPU === "undefined") {
        console.warn(
          "RNWebGPU is not available. Make sure SK_GRAPHITE is enabled."
        );
        return;
      }
      const ctx = canvasRef.current.getContext("webgpu");
      if (!ctx) {
        console.warn("Failed to get WebGPU context");
        return;
      }

      const device = Skia.getDevice();
      const format = navigator.gpu.getPreferredCanvasFormat();
      ctx.configure({ device, format, alphaMode: "opaque" });

      // Source image + native buffer are created once; only the import (and the
      // rotation/mirror transform it carries) is repeated per frame.
      const image = makeSourceImage();
      const nativeBuffer: NativeBuffer = Skia.NativeBuffer.MakeFromImage(image);

      const module = device.createShaderModule({ code: shader });
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

      let running = true;
      let frame = 0;

      const render = () => {
        if (!running) {
          return;
        }
        // Advance the rotation a quarter-turn (and toggle mirroring) roughly
        // once a second so the Skia-only sampling transforms are visible.
        const step = Math.floor(frame / 60);
        const rotation = (step % 4) * 90;
        const mirrored = Math.floor(step / 4) % 2 === 1;
        frame++;

        // Import the native buffer as an external texture for this frame. This
        // is the same pattern you'd use to import a fresh video frame.
        const externalTexture = device.importExternalTexture({
          source: nativeBuffer,
          rotation,
          mirrored,
          label: "skia-frame",
        });
        const bindGroup = device.createBindGroup({
          layout: pipeline.getBindGroupLayout(0),
          entries: [
            { binding: 0, resource: externalTexture },
            { binding: 1, resource: sampler },
          ],
        });

        const texture = ctx.getCurrentTexture();
        const encoder = device.createCommandEncoder();
        const pass = encoder.beginRenderPass({
          colorAttachments: [
            {
              view: texture.createView(),
              clearValue: { r: 0.1, g: 0.1, b: 0.1, a: 1.0 },
              loadOp: "clear",
              storeOp: "store",
            },
          ],
        });
        pass.setPipeline(pipeline);
        pass.setBindGroup(0, bindGroup);
        pass.draw(3);
        pass.end();
        device.queue.submit([encoder.finish()]);
        ctx.present();
        // End the external texture's access window now that the sampling work
        // is submitted; Dawn keeps the underlying texture alive for the
        // in-flight GPU work via its fences.
        externalTexture.destroy();

        animationRef.current = requestAnimationFrame(render);
      };
      animationRef.current = requestAnimationFrame(render);

      cleanupRef.current = () => {
        running = false;
        cancelAnimationFrame(animationRef.current);
        // All GPU work referencing the buffer has been submitted; release it.
        Skia.NativeBuffer.Release(nativeBuffer);
      };
    }, 100);

    return () => {
      clearTimeout(timeoutId);
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
