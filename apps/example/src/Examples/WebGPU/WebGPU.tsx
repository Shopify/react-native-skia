import type { SkImage } from "@shopify/react-native-skia";
import {
  BackdropBlur,
  Canvas,
  ColorMatrix,
  Fill,
  fitbox,
  Group,
  Image,
  mix,
  Path,
  processTransform3d,
  rect,
  Skia,
  StrokeCap,
  StrokeJoin,
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

const path = `M1457 851.5C1306.6 687.9 1146.2 811.3 1182.1 949.2 1194.7 997.8 1231.9 1048.3 1302.5 1088.7 1400.2 1144.4 1442.2 1209.1 1445.8 1268 1454.2 1402.7 1262.6 1507.4 1080 1406.3M1521.9 1268C1785.9 918.8 1788.4 730.7 1731.6 714.1 1692.4 704.1 1626.1 771.8 1596.4 924.4 1563.2 1100.6 1550.3 1200.5 1521.9 1439.8M1521.9 1439.9C1563.4 1324.6 1587.1 1226.3 1669.5 1160.3 1693.8 1140.6 1723.7 1129 1755 1127.1 1891.1 1119.9 1871.1 1309.7 1660.2 1268M1660.2 1268C1749.6 1284.8 1738.2 1341.5 1763.5 1406.2 1767.1 1415.7 1773.3 1424.1 1781.4 1430.3 1834.7 1470.2 1930.5 1391 1959.4 1339.3 2004.3 1273.9 2039 1200.1 2073.9 1129.7M2119.5 1022C2119.5 1027.1 2115.3 1031.3 2110.2 1031.3M2110.2 1031.3C2105.1 1031.3 2100.9 1027.1 2100.9 1022M2100.9 1022C2100.9 1016.8 2104.9 1014 2110.2 1014M2110.2 1014C2115.5 1014 2119.5 1016.8 2119.5 1022M2074 1129.8C2038.6 1218.4 2016 1286 2005.9 1332.9 1997.1 1404 2014.9 1436.2 2044.4 1443.4 2109.4 1458.5 2230.5 1351.8 2248.9 1270.3 2284.3 1113.5 2512.7 1055.5 2565.4 1239.5M2565.4 1239.2C2512.7 1055.2 2283.8 1113.5 2248.9 1270.1 2239 1335.3 2259 1382.1 2293.1 1410.6 2311.4 1425.5 2333.5 1435.6 2357 1439.9 2395.3 1446.6 2435 1440.4 2469.3 1422.3M2471.4 1421.3C2471.4 1421.3 2473.6 1419.9 2475.7 1418.9 2497.3 1406.1 2515.9 1388.5 2529.7 1367.5 2543.6 1346.5 2552.4 1322.5 2555.3 1297.5 2563 1238.1 2581.4 1172.9 2593.6 1128.7M2593.6 1128.7C2574.5 1198.7 2539.1 1319.3 2556.9 1389.9 2560.9 1406.1 2571 1420.2 2585.4 1429.3 2599.5 1438 2616.8 1441.2 2633.3 1437.8 2680.9 1427.4 2729.9 1379.2 2760 1331.6`;
const logo = Skia.Path.MakeFromSVGString(path)!;
const bounds = logo.computeTightBounds();

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
  const clip = useDerivedValue(() => {
    const trimmed = logo.copy();
    const transform = fitbox(
      "contain",
      bounds,
      rect(20, 20, width - 40, height - 40)
    );
    trimmed.transform(processTransform3d(transform));
    trimmed.trim(0, progress.value, false);
    trimmed.stroke({
      width: 20,
      join: StrokeJoin.Round,
      cap: StrokeCap.Round,
    });
    return trimmed;
  });
  //rect(0, 0, 300, (300 * bounds.height) / bounds.width);

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
          ></Image>
        )}
        <Group clip={clip}>
          {image && (
            <Image
              image={image}
              x={0}
              y={0}
              height={height}
              width={width}
              fit="cover"
            >
              <ColorMatrix
                matrix={[
                  -1, 0, 0, 0, 1, 0, -1, 0, 0, 1, 0, 0, -1, 0, 1, 0, 0, 0, 1, 0,
                ]}
              />
            </Image>
          )}
          <Fill color="rgba(255, 255, 255, 0.4)" />
        </Group>
        {/* <Path
          path={clip}
          color="rgba(0,0,0,0.5)"
          strokeCap="round"
          strokeJoin="round"
          style="stroke"
          strokeWidth={20}
        /> */}
        {/* <BackdropBlur blur={4} clip={clip}>
          <Fill color="rgba(0, 0, 0, 0.2)" />
        </BackdropBlur>
*/}
      </Canvas>
    </View>
  );
}

const style = StyleSheet.create({
  container: {
    flex: 1,
  },
});
