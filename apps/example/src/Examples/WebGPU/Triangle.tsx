import React, { useEffect, useRef } from "react";
import { StyleSheet, View, Text } from "react-native";
import type { WebGPUCanvasRef } from "@shopify/react-native-skia";
import { WebGPUCanvas } from "@shopify/react-native-skia";

const triangleShader = `
@vertex
fn vs_main(@builtin(vertex_index) vertexIndex: u32) -> @builtin(position) vec4f {
  var pos = array<vec2f, 3>(
    vec2f( 0.0,  0.5),
    vec2f(-0.5, -0.5),
    vec2f( 0.5, -0.5)
  );
  return vec4f(pos[vertexIndex], 0.0, 1.0);
}

@fragment
fn fs_main() -> @location(0) vec4f {
  return vec4f(1.0, 0.5, 0.2, 1.0);
}
`;

export function Triangle() {
  const canvasRef = useRef<WebGPUCanvasRef>(null);
  const animationRef = useRef<number>(0);
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    // Small delay to ensure the canvas is mounted
    const timeoutId = setTimeout(async () => {
      if (!canvasRef.current) {
        return;
      }

      // Check if RNWebGPU is available (SK_GRAPHITE must be enabled)
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

      // Get the device from navigator.gpu
      const adapter = await navigator.gpu.requestAdapter();
      if (!adapter) {
        console.warn("Failed to get GPU adapter");
        return;
      }

      const device = await adapter.requestDevice();

      // Configure the context
      const format = navigator.gpu.getPreferredCanvasFormat();
      ctx.configure({
        device,
        format,
        alphaMode: "opaque",
      });

      // Create shader module
      const shaderModule = device.createShaderModule({
        code: triangleShader,
      });

      // Create render pipeline
      const pipeline = device.createRenderPipeline({
        layout: "auto",
        vertex: {
          module: shaderModule,
          entryPoint: "vs_main",
        },
        fragment: {
          module: shaderModule,
          entryPoint: "fs_main",
          targets: [{ format }],
        },
        primitive: {
          topology: "triangle-list",
        },
      });

      let running = true;

      const render = () => {
        if (!running) {
          return;
        }

        const texture = ctx.getCurrentTexture();
        const renderPassDescriptor: GPURenderPassDescriptor = {
          colorAttachments: [
            {
              view: texture.createView(),
              clearValue: { r: 0.1, g: 0.1, b: 0.1, a: 1.0 },
              loadOp: "clear",
              storeOp: "store",
            },
          ],
        };

        const commandEncoder = device.createCommandEncoder();
        const passEncoder = commandEncoder.beginRenderPass(renderPassDescriptor);
        passEncoder.setPipeline(pipeline);
        passEncoder.draw(3);
        passEncoder.end();

        device.queue.submit([commandEncoder.finish()]);
        ctx.present();

        animationRef.current = requestAnimationFrame(render);
      };

      animationRef.current = requestAnimationFrame(render);

      cleanupRef.current = () => {
        running = false;
        cancelAnimationFrame(animationRef.current);
      };
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      cleanupRef.current?.();
    };
  }, []);

  // Check if WebGPU is available
  if (typeof RNWebGPU === "undefined") {
    return (
      <View style={styles.container}>
        <View style={styles.messageContainer}>
          <Text style={styles.message}>
            WebGPU Canvas requires SK_GRAPHITE to be enabled.
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
