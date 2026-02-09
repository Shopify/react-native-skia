import React, { useEffect, useRef } from "react";
import { StyleSheet, View, Text } from "react-native";
import type { SkCanvas, WebGPUCanvasRef } from "@shopify/react-native-skia";
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

const TEXTURE_SIZE = 512;
const paint = Skia.Paint();

function drawTexture1(canvas: SkCanvas, t: number) {
  canvas.drawColor(Skia.Color("cyan"));
  paint.setColor(Skia.Color("white"));
  const r = 100 + Math.sin(t * 2) * 80;
  canvas.drawCircle(256, 256, r, paint);
}

function drawTexture2(canvas: SkCanvas, t: number) {
  canvas.drawColor(Skia.Color("pink"));
  paint.setColor(Skia.Color("black"));
  const x = 256 + Math.cos(t * 3) * 100;
  canvas.drawCircle(x, 256, 80, paint);
}

function drawTexture3(canvas: SkCanvas, t: number) {
  canvas.drawColor(Skia.Color("yellow"));
  paint.setColor(Skia.Color("red"));
  const y = 256 + Math.sin(t * 4) * 100;
  canvas.drawCircle(256, y, 60, paint);
}

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
        return;
      }
      const ctx = canvasRef.current.getContext("webgpu");
      if (!ctx) {
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
          module: device.createShaderModule({ code: basicVertWGSL }),
          buffers: [
            {
              arrayStride: cubeVertexSize,
              attributes: [
                {
                  shaderLocation: 0,
                  offset: cubePositionOffset,
                  format: "float32x4",
                },
                {
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
          targets: [{ format: presentationFormat }],
        },
        primitive: { topology: "triangle-list", cullMode: "back" },
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

      const uniformBuffer = device.createBuffer({
        size: 4 * 16,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
      });

      const surface1 = Skia.Surface.MakeOffscreen(TEXTURE_SIZE, TEXTURE_SIZE)!;
      const surface2 = Skia.Surface.MakeOffscreen(TEXTURE_SIZE, TEXTURE_SIZE)!;

      const sampler = device.createSampler({
        magFilter: "linear",
        minFilter: "linear",
      });

      const bindGroupLayout = pipeline.getBindGroupLayout(0);

      function createBindGroup(texture: GPUTexture) {
        return device.createBindGroup({
          layout: bindGroupLayout,
          entries: [
            { binding: 0, resource: { buffer: uniformBuffer } },
            { binding: 1, resource: sampler },
            { binding: 2, resource: texture.createView() },
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
      const mvp = mat4Identity();

      function getTransformationMatrix(): Mat4 {
        const view = mat4Identity();
        mat4Translate(view, [0, 0, -4] as Vec3, view);
        const now = Date.now() / 1000;
        mat4Rotate(view, [Math.sin(now), Math.cos(now), 0] as Vec3, 1, view);
        mat4Multiply(projectionMatrix, view, mvp);
        return mvp;
      }

      let running = true;

      const render = () => {
        if (!running) {
          return;
        }
        const t = Date.now() / 1000;

        // Update Skia textures
        drawTexture1(surface1.getCanvas(), t);
        surface1.flush();
        const tex1 = Skia.Image.MakeTextureFromImage(
          surface1.makeImageSnapshot()
        );
        const bindGroup1 = createBindGroup(tex1);

        drawTexture2(surface2.getCanvas(), t);
        surface2.flush();
        const tex2 = Skia.Image.MakeTextureFromImage(
          surface2.makeImageSnapshot()
        );
        const bindGroup2 = createBindGroup(tex2);

        // Update MVP matrix
        const mat = getTransformationMatrix();
        device.queue.writeBuffer(
          uniformBuffer,
          0,
          mat.buffer,
          mat.byteOffset,
          mat.byteLength
        );

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (renderPassDescriptor.colorAttachments as any)[0].view = ctx
          .getCurrentTexture()
          .createView();

        const commandEncoder = device.createCommandEncoder();
        const pass = commandEncoder.beginRenderPass(renderPassDescriptor);
        pass.setPipeline(pipeline);
        pass.setVertexBuffer(0, verticesBuffer);

        // First 3 faces with texture 1
        pass.setBindGroup(0, bindGroup1);
        pass.draw(18, 1, 0, 0);

        // Last 3 faces with texture 2
        pass.setBindGroup(0, bindGroup2);
        pass.draw(18, 1, 18, 0);

        pass.end();
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
