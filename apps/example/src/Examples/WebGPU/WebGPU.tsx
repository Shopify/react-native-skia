import type { SkImage } from "@shopify/react-native-skia";
import {
  Canvas,
  ColorMatrix,
  Image,
  mix,
  Skia,
} from "@shopify/react-native-skia";
import React, { useEffect, useRef, useState } from "react";
import {
  PixelRatio,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import { useDerivedValue } from "react-native-reanimated";

import { useLoop } from "../../components/Animations";

import { solidColorLitWGSL, wireframeWGSL } from "./Shaders";
import { modelData } from "./models";
import { randColor, randElement } from "./utils";
import {
  mat4Identity,
  mat4Perspective,
  mat4LookAt,
  mat4Multiply,
  mat4Translate,
  mat4RotateX,
  mat4RotateY,
  mat3FromMat4,
  type Vec3,
} from "./matrix";

function createBufferWithData(
  device: GPUDevice,
  data: Float32Array | Uint32Array,
  usage: GPUBufferUsageFlags
) {
  const buffer = device.createBuffer({
    size: data.byteLength,
    usage,
  });
  device.queue.writeBuffer(buffer, 0, data as unknown as BufferSource);
  return buffer;
}

type Model = {
  vertexBuffer: GPUBuffer;
  indexBuffer: GPUBuffer;
  indexFormat: GPUIndexFormat;
  vertexCount: number;
};

const settings = {
  barycentricCoordinatesBased: false,
  thickness: 2,
  alphaThreshold: 0.5,
  animate: true,
  lines: true,
  depthBias: 1,
  depthBiasSlopeScale: 0.5,
  models: true,
};

function createVertexAndIndexBuffer(
  device: GPUDevice,
  { vertices, indices }: { vertices: Float32Array; indices: Uint32Array }
): Model {
  const vertexBuffer = createBufferWithData(
    device,
    vertices,
    GPUBufferUsage.VERTEX | GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST
  );
  const indexBuffer = createBufferWithData(
    device,
    indices,
    GPUBufferUsage.INDEX | GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST
  );
  return {
    vertexBuffer,
    indexBuffer,
    indexFormat: "uint32",
    vertexCount: indices.length,
  };
}

type ObjectInfo = {
  worldViewProjectionMatrixValue: Float32Array;
  worldMatrixValue: Float32Array;
  uniformValues: Float32Array;
  uniformBuffer: GPUBuffer;
  lineUniformValues: Float32Array;
  lineUniformBuffer: GPUBuffer;
  litBindGroup: GPUBindGroup;
  wireframeBindGroups: GPUBindGroup[];
  model: Model;
};

// prettier-ignore
const identityMatrix = [
  1, 0, 0, 0, 0,
  0, 1, 0, 0, 0,
  0, 0, 1, 0, 0,
  0, 0, 0, 1, 0,
];

// prettier-ignore
const grayscaleMatrix = [
  0.2126, 0.7152, 0.0722, 0, 0,
  0.2126, 0.7152, 0.0722, 0, 0,
  0.2126, 0.7152, 0.0722, 0, 0,
  0,      0,      0,      1, 0,
];

export function WebGPU() {
  const { width, height } = useWindowDimensions();
  const [image, setImage] = useState<SkImage | null>(null);
  const renderRef = useRef<((ts: number) => void) | null>(null);
  const frameRef = useRef<number>(0);
  const cleanupRef = useRef<(() => void) | null>(null);

  const progress = useLoop({ duration: 3000 });

  const colorMatrix = useDerivedValue(() => {
    return identityMatrix.map((identity, i) =>
      mix(progress.value, identity, grayscaleMatrix[i])
    );
  });

  const pd = PixelRatio.get();
  const canvasWidth = Math.floor(width * pd);
  const canvasHeight = Math.floor(height * pd);

  useEffect(() => {
    const device = Skia.getDevice();
    const presentationFormat = navigator.gpu.getPreferredCanvasFormat();
    const depthFormat = "depth24plus";

    const models = Object.values(modelData).map((data) =>
      createVertexAndIndexBuffer(device, data)
    );

    const litModule = device.createShaderModule({
      code: solidColorLitWGSL,
    });

    const wireframeModule = device.createShaderModule({
      code: wireframeWGSL,
    });

    const litBindGroupLayout = device.createBindGroupLayout({
      label: "lit bind group layout",
      entries: [
        {
          binding: 0,
          visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
          buffer: {},
        },
      ],
    });

    const litPipeline = device.createRenderPipeline({
      label: "lit pipeline",
      layout: device.createPipelineLayout({
        bindGroupLayouts: [litBindGroupLayout],
      }),
      vertex: {
        module: litModule,
        buffers: [
          {
            arrayStride: 6 * 4, // position, normal
            attributes: [
              {
                // position
                shaderLocation: 0,
                offset: 0,
                format: "float32x3",
              },
              {
                // normal
                shaderLocation: 1,
                offset: 3 * 4,
                format: "float32x3",
              },
            ],
          },
        ],
      },
      fragment: {
        module: litModule,
        targets: [{ format: presentationFormat }],
      },
      primitive: {
        cullMode: "back",
      },
      depthStencil: {
        depthWriteEnabled: true,
        depthCompare: "less",
        depthBias: settings.depthBias,
        depthBiasSlopeScale: settings.depthBiasSlopeScale,
        format: depthFormat,
      },
    });

    const wireframePipeline = device.createRenderPipeline({
      label: "wireframe pipeline",
      layout: "auto",
      vertex: {
        module: wireframeModule,
        entryPoint: "vsIndexedU32",
      },
      fragment: {
        module: wireframeModule,
        entryPoint: "fs",
        targets: [{ format: presentationFormat }],
      },
      primitive: {
        topology: "line-list",
      },
      depthStencil: {
        depthWriteEnabled: true,
        depthCompare: "less-equal",
        format: depthFormat,
      },
    });

    const barycentricCoordinatesBasedWireframePipeline =
      device.createRenderPipeline({
        label: "barycentric coordinates based wireframe pipeline",
        layout: "auto",
        vertex: {
          module: wireframeModule,
          entryPoint: "vsIndexedU32BarycentricCoordinateBasedLines",
        },
        fragment: {
          module: wireframeModule,
          entryPoint: "fsBarycentricCoordinateBasedLines",
          targets: [
            {
              format: presentationFormat,
              blend: {
                color: {
                  srcFactor: "one",
                  dstFactor: "one-minus-src-alpha",
                },
                alpha: {
                  srcFactor: "one",
                  dstFactor: "one-minus-src-alpha",
                },
              },
            },
          ],
        },
        primitive: {
          topology: "triangle-list",
        },
        depthStencil: {
          depthWriteEnabled: true,
          depthCompare: "less-equal",
          format: depthFormat,
        },
      });

    const objectInfos: ObjectInfo[] = [];

    const numObjects = 200;
    for (let i = 0; i < numObjects; ++i) {
      const uniformValues = new Float32Array(16 + 16 + 4);
      const uniformBuffer = device.createBuffer({
        size: uniformValues.byteLength,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
      });
      const kWorldViewProjectionMatrixOffset = 0;
      const kWorldMatrixOffset = 16;
      const kColorOffset = 32;
      const worldViewProjectionMatrixValue = uniformValues.subarray(
        kWorldViewProjectionMatrixOffset,
        kWorldViewProjectionMatrixOffset + 16
      );
      const worldMatrixValue = uniformValues.subarray(
        kWorldMatrixOffset,
        kWorldMatrixOffset + 15
      );
      const colorValue = uniformValues.subarray(kColorOffset, kColorOffset + 4);
      colorValue.set(randColor());

      const model = randElement(models);

      const litBindGroup = device.createBindGroup({
        layout: litBindGroupLayout,
        entries: [{ binding: 0, resource: { buffer: uniformBuffer } }],
      });

      const lineUniformValues = new Float32Array(3 + 1);
      const lineUniformValuesAsU32 = new Uint32Array(lineUniformValues.buffer);
      const lineUniformBuffer = device.createBuffer({
        size: lineUniformValues.byteLength,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
      });
      lineUniformValuesAsU32[0] = 6; // array stride for positions

      const wireframeBindGroup = device.createBindGroup({
        layout: wireframePipeline.getBindGroupLayout(0),
        entries: [
          { binding: 0, resource: { buffer: uniformBuffer } },
          { binding: 1, resource: { buffer: model.vertexBuffer } },
          { binding: 2, resource: { buffer: model.indexBuffer } },
          { binding: 3, resource: { buffer: lineUniformBuffer } },
        ],
      });

      const barycentricCoordinatesBasedWireframeBindGroup =
        device.createBindGroup({
          layout:
            barycentricCoordinatesBasedWireframePipeline.getBindGroupLayout(0),
          entries: [
            { binding: 0, resource: { buffer: uniformBuffer } },
            { binding: 1, resource: { buffer: model.vertexBuffer } },
            { binding: 2, resource: { buffer: model.indexBuffer } },
            { binding: 3, resource: { buffer: lineUniformBuffer } },
          ],
        });

      objectInfos.push({
        worldViewProjectionMatrixValue,
        worldMatrixValue,
        uniformValues,
        uniformBuffer,
        lineUniformValues,
        lineUniformBuffer,
        litBindGroup,
        wireframeBindGroups: [
          wireframeBindGroup,
          barycentricCoordinatesBasedWireframeBindGroup,
        ],
        model,
      });
    }

    // Update line uniforms
    objectInfos.forEach(({ lineUniformBuffer, lineUniformValues }) => {
      lineUniformValues[1] = settings.thickness;
      lineUniformValues[2] = settings.alphaThreshold;
      device.queue.writeBuffer(lineUniformBuffer, 0, lineUniformValues);
    });

    // Create render target texture
    const texture = device.createTexture({
      size: [canvasWidth, canvasHeight, 1],
      format: presentationFormat,
      usage:
        GPUTextureUsage.TEXTURE_BINDING |
        GPUTextureUsage.COPY_DST |
        GPUTextureUsage.RENDER_ATTACHMENT,
    });

    // Create depth texture
    const depthTexture = device.createTexture({
      size: [canvasWidth, canvasHeight],
      format: depthFormat,
      usage: GPUTextureUsage.RENDER_ATTACHMENT,
    });

    const renderPassDescriptor: GPURenderPassDescriptor = {
      label: "wireframe render pass",
      colorAttachments: [
        {
          view: texture.createView(),
          clearValue: [0.3, 0.3, 0.3, 1],
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

    let time = 0.0;

    const render = (ts: number) => {
      if (settings.animate) {
        time = ts * 0.001;
      }

      const fov = (60 * Math.PI) / 180;
      const aspect = canvasWidth / canvasHeight;
      const projection = mat4Perspective(fov, aspect, 0.1, 1000);

      const view = mat4LookAt(
        [-300, 0, 300] as Vec3,
        [0, 0, 0] as Vec3,
        [0, 1, 0] as Vec3
      );

      const viewProjection = mat4Multiply(projection, view);

      const encoder = device.createCommandEncoder();
      const pass = encoder.beginRenderPass(renderPassDescriptor);
      pass.setPipeline(litPipeline);

      objectInfos.forEach(
        (
          {
            uniformBuffer,
            uniformValues,
            worldViewProjectionMatrixValue,
            worldMatrixValue,
            litBindGroup,
            model: { vertexBuffer, indexBuffer, indexFormat, vertexCount },
          },
          i
        ) => {
          const world = mat4Identity();
          mat4Translate(
            world,
            [0, 0, Math.sin(i * 3.721 + time * 0.1) * 200] as Vec3,
            world
          );
          mat4RotateX(world, i * 4.567, world);
          mat4RotateY(world, i * 2.967, world);
          mat4Translate(
            world,
            [0, 0, Math.sin(i * 9.721 + time * 0.1) * 200] as Vec3,
            world
          );
          mat4RotateX(world, time * 0.53 + i, world);

          mat4Multiply(viewProjection, world, worldViewProjectionMatrixValue);
          mat3FromMat4(world, worldMatrixValue);

          device.queue.writeBuffer(uniformBuffer, 0, uniformValues);

          if (settings.models) {
            pass.setVertexBuffer(0, vertexBuffer);
            pass.setIndexBuffer(indexBuffer, indexFormat);
            pass.setBindGroup(0, litBindGroup);
            pass.drawIndexed(vertexCount);
          }
        }
      );

      if (settings.lines) {
        const [bindGroupNdx, countMult, pipeline] =
          settings.barycentricCoordinatesBased
            ? [1, 1, barycentricCoordinatesBasedWireframePipeline]
            : [0, 2, wireframePipeline];
        pass.setPipeline(pipeline);
        objectInfos.forEach(
          ({ wireframeBindGroups, model: { vertexCount } }) => {
            pass.setBindGroup(0, wireframeBindGroups[bindGroupNdx]);
            pass.draw(vertexCount * countMult);
          }
        );
      }

      pass.end();

      const commandBuffer = encoder.finish();
      device.queue.submit([commandBuffer]);

      // Convert texture to SkImage
      const skImage = Skia.Image.MakeImageFromTexture(texture);
      setImage(skImage);
    };

    renderRef.current = render;

    // Animation loop
    let running = true;
    const animate = (ts: number) => {
      if (!running) {
        return;
      }
      render(ts);
      frameRef.current = requestAnimationFrame(animate);
    };
    frameRef.current = requestAnimationFrame(animate);

    cleanupRef.current = () => {
      running = false;
      cancelAnimationFrame(frameRef.current);
      texture.destroy();
      depthTexture.destroy();
    };

    return () => {
      cleanupRef.current?.();
    };
  }, [canvasWidth, canvasHeight]);

  return (
    <View style={style.container}>
      <Canvas style={{ flex: 1 }}>
        {image && (
          <Image
            image={image}
            x={0}
            y={0}
            height={height}
            width={width}
            fit="cover"
          >
            <ColorMatrix matrix={colorMatrix} />
          </Image>
        )}
      </Canvas>
    </View>
  );
}

const style = StyleSheet.create({
  container: {
    flex: 1,
  },
});
