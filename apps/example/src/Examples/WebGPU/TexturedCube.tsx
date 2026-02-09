import React, { useEffect, useRef } from "react";
import { StyleSheet, View, Text } from "react-native";
import type { WebGPUCanvasRef } from "@shopify/react-native-skia";
import { WebGPUCanvas, Skia } from "@shopify/react-native-skia";

import {
  cubePositionOffset,
  cubeUVOffset,
  cubeVertexArray,
  cubeVertexSize,
} from "./cube";
import { basicVertWGSL, sampleTextureMixColorWGSL } from "./Shaders";
import {
  mat4Identity,
  mat4Multiply,
  mat4Perspective,
  mat4Rotate,
  mat4Translate,
  type Mat4,
  type Vec3,
} from "./matrix";

export function TexturedCube() {
  const canvasRef = useRef<WebGPUCanvasRef>(null);
  const animationRef = useRef<number>(0);
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const timeoutId = setTimeout(async () => {
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
      const canvas = ctx.canvas as HTMLCanvasElement;
      const presentationFormat = navigator.gpu.getPreferredCanvasFormat();

      ctx.configure({
        device,
        format: presentationFormat,
        alphaMode: "premultiplied",
      });

      // Create a vertex buffer from the cube data.
      const verticesBuffer = device.createBuffer({
        size: cubeVertexArray.byteLength,
        usage: GPUBufferUsage.VERTEX,
        mappedAtCreation: true,
      });
      new Float32Array(verticesBuffer.getMappedRange()).set(cubeVertexArray);
      verticesBuffer.unmap();

      const pipeline = device.createRenderPipeline({
        layout: "auto",
        vertex: {
          module: device.createShaderModule({
            code: basicVertWGSL,
          }),
          buffers: [
            {
              arrayStride: cubeVertexSize,
              attributes: [
                {
                  // position
                  shaderLocation: 0,
                  offset: cubePositionOffset,
                  format: "float32x4",
                },
                {
                  // uv
                  shaderLocation: 1,
                  offset: cubeUVOffset,
                  format: "float32x2",
                },
              ],
            },
          ],
        },
        fragment: {
          module: device.createShaderModule({
            code: sampleTextureMixColorWGSL,
          }),
          targets: [
            {
              format: presentationFormat,
            },
          ],
        },
        primitive: {
          topology: "triangle-list",
          cullMode: "back",
        },
        depthStencil: {
          depthWriteEnabled: true,
          depthCompare: "less",
          format: "depth24plus",
        },
      });

      const depthTexture = device.createTexture({
        size: [canvas.width, canvas.height],
        format: "depth24plus",
        usage: GPUTextureUsage.RENDER_ATTACHMENT,
      });

      const uniformBufferSize = 4 * 16; // 4x4 matrix
      const uniformBuffer = device.createBuffer({
        size: uniformBufferSize,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
      });

      // Create two Skia offscreen surfaces for the cube textures.
      const textureSize = 512;
      const surface1 = Skia.Surface.MakeOffscreen(textureSize, textureSize)!;
      const surface2 = Skia.Surface.MakeOffscreen(textureSize, textureSize)!;
      const paint = Skia.Paint();

      // Draw on surface 1 — customize this per frame below.
      function drawTexture1(t: number) {
        const c = surface1.getCanvas();
        c.drawColor(Skia.Color("cyan"));
        paint.setColor(Skia.Color("white"));
        const r = 100 + Math.sin(t * 2) * 80;
        c.drawCircle(256, 256, r, paint);
        surface1.flush();
      }

      // Draw on surface 2 — customize this per frame below.
      function drawTexture2(t: number) {
        const c = surface2.getCanvas();
        c.drawColor(Skia.Color("pink"));
        paint.setColor(Skia.Color("black"));
        const x = 256 + Math.cos(t * 3) * 100;
        c.drawCircle(x, 256, 80, paint);
        surface2.flush();
      }

      // Create a sampler with linear filtering for smooth interpolation.
      const sampler = device.createSampler({
        magFilter: "linear",
        minFilter: "linear",
      });

      const bindGroupLayout = pipeline.getBindGroupLayout(0);

      function createBindGroup(texture: GPUTexture) {
        return device.createBindGroup({
          layout: bindGroupLayout,
          entries: [
            {
              binding: 0,
              resource: { buffer: uniformBuffer },
            },
            {
              binding: 1,
              resource: sampler,
            },
            {
              binding: 2,
              resource: texture.createView(),
            },
          ],
        });
      }

      const renderPassDescriptor: GPURenderPassDescriptor = {
        colorAttachments: [
          {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            view: undefined as any,
            clearValue: [0.5, 0.5, 0.5, 1.0],
            loadOp: "clear",
            storeOp: "store",
          },
        ],
        depthStencilAttachment: {
          view: depthTexture.createView(),
          depthClearValue: 1.0,
          depthLoadOp: "clear",
          depthStoreOp: "store",
        },
      };

      const aspect = canvas.width / canvas.height;
      const projectionMatrix = mat4Perspective(
        (2 * Math.PI) / 5,
        aspect,
        1,
        100.0
      );
      const modelViewProjectionMatrix = mat4Identity();

      function getTransformationMatrix(): Mat4 {
        const viewMatrix = mat4Identity();
        mat4Translate(viewMatrix, [0, 0, -4] as Vec3, viewMatrix);
        const now = Date.now() / 1000;
        mat4Rotate(
          viewMatrix,
          [Math.sin(now), Math.cos(now), 0] as Vec3,
          1,
          viewMatrix
        );
        mat4Multiply(projectionMatrix, viewMatrix, modelViewProjectionMatrix);
        return modelViewProjectionMatrix;
      }

      let running = true;

      const render = () => {
        if (!running) {
          return;
        }

        const t = Date.now() / 1000;

        // Update Skia drawings each frame
        drawTexture1(t);
        const tex1 = Skia.Image.MakeTextureFromImage(
          surface1.makeImageSnapshot()
        );
        const bindGroup1 = createBindGroup(tex1);

        drawTexture2(t);
        const tex2 = Skia.Image.MakeTextureFromImage(
          surface2.makeImageSnapshot()
        );
        const bindGroup2 = createBindGroup(tex2);

        const transformationMatrix = getTransformationMatrix();
        device.queue.writeBuffer(
          uniformBuffer,
          0,
          transformationMatrix.buffer,
          transformationMatrix.byteOffset,
          transformationMatrix.byteLength
        );

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (renderPassDescriptor.colorAttachments as any)[0].view = ctx
          .getCurrentTexture()
          .createView();

        const commandEncoder = device.createCommandEncoder();
        const passEncoder =
          commandEncoder.beginRenderPass(renderPassDescriptor);
        passEncoder.setPipeline(pipeline);
        passEncoder.setVertexBuffer(0, verticesBuffer);

        // First 3 faces (18 vertices) with texture 1
        passEncoder.setBindGroup(0, bindGroup1);
        passEncoder.draw(18, 1, 0, 0);

        // Last 3 faces (18 vertices) with texture 2
        passEncoder.setBindGroup(0, bindGroup2);
        passEncoder.draw(18, 1, 18, 0);

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
