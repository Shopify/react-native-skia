import type { SkImage } from "@shopify/react-native-skia";
import { Canvas, ColorMatrix, Image, Skia } from "@shopify/react-native-skia";
import React, { useEffect, useRef, useState } from "react";
import {
  PixelRatio,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";

export const triangleVertWGSL = /* wgsl */ `@vertex
fn main(
  @builtin(vertex_index) VertexIndex : u32
) -> @builtin(position) vec4f {
  var pos = array<vec2f, 3>(
    vec2(0.0, 0.5),
    vec2(-0.5, -0.5),
    vec2(0.5, -0.5)
  );

  return vec4f(pos[VertexIndex], 0.0, 1.0);
}`;

export const redFragWGSL = /* wgsl */ `@fragment
fn main() -> @location(0) vec4f {
  return vec4(1.0, 0.0, 0.0, 1.0);
}`;

export function WebGPU() {
  const { width, height } = useWindowDimensions();
  const [image, setImage] = useState<SkImage | null>(null);
  useEffect(() => {
    const device = Skia.getDevice();

    console.log("Device created");

    const presentationFormat = navigator.gpu.getPreferredCanvasFormat();

    const pipeline = device.createRenderPipeline({
      layout: "auto",
      vertex: {
        module: device.createShaderModule({
          code: triangleVertWGSL,
        }),
        entryPoint: "main",
      },
      fragment: {
        module: device.createShaderModule({
          code: redFragWGSL,
        }),
        entryPoint: "main",
        targets: [
          {
            format: presentationFormat,
          },
        ],
      },
      primitive: {
        topology: "triangle-list",
      },
    });
    console.log("Pipeline created");
    const commandEncoder = device.createCommandEncoder();
    console.log("Command encoder created");

    const texture = device.createTexture({
      size: [width * PixelRatio.get(), height * PixelRatio.get(), 1],
      format: presentationFormat,
      usage:
        GPUTextureUsage.TEXTURE_BINDING |
        GPUTextureUsage.COPY_DST |
        GPUTextureUsage.RENDER_ATTACHMENT,
    });
    console.log("Texture created");

    if (!texture) {
      throw new Error("Couldn't create texture");
    }
    const textureView = texture.createView();

    const renderPassDescriptor: GPURenderPassDescriptor = {
      colorAttachments: [
        {
          view: textureView,
          clearValue: [0, 0, 0, 0],
          loadOp: "clear",
          storeOp: "store",
        },
      ],
    };
    const passEncoder = commandEncoder.beginRenderPass(renderPassDescriptor);
    passEncoder.setPipeline(pipeline);
    passEncoder.draw(3);
    passEncoder.end();

    device.queue.submit([commandEncoder.finish()]);

    setImage(Skia.Image.MakeImageFromTexture(texture!));
  }, [height, width]);

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
            <ColorMatrix
              matrix={[
                -0.578, 0.99, 0.588, 0, 0, 0.469, 0.535, -0.003, 0, 0, 0.015,
                1.69, -0.703, 0, 0, 0, 0, 0, 1, 0,
              ]}
            />
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
