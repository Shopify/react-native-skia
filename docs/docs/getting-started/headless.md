---
id: headless
title: Headless
sidebar_label: Headless
slug: /getting-started/headless
---

Thanks to its offscreen capabilities, React Native Skia can run on Node.
This means that you can use the Skia API to draw things that can be encoded and saved as images.
By default, drawings will be executed on the CPU but it is possible to also use [GPU Acceleration](#gpu-acceleration).

## Hello World

You will notice in the example below that the import URL looks different than the one used in React Native. There are two reasons for it. First, because Node programs don't rely on module bundlers such as Webpack, you will need to use the commonjs build of React Native Skia. Finally, we want to import the Skia APIs we need on Node without importing the one that rely on pure React Native APIs.

```tsx
import { LoadSkiaWeb } from "@shopify/react-native-skia/lib/commonjs/web/LoadSkiaWeb";
import { Fill, draw } from "@shopify/react-native-skia/lib/commonjs/headless";

(async () => {
  const width = 256;
  const height = 256;
  const r = size * 0.33;
  await LoadSkiaWeb();
  const image = draw(
    <Group blendMode="multiply">
        <Circle cx={r} cy={r} r={r} color="cyan" />
        <Circle cx={size - r} cy={r} r={r} color="magenta" />
        <Circle
          cx={size/2}
          cy={size - r}
          r={r}
          color="yellow"
        />
    </Group>, width, height);
  console.log(image.encodeToBase64());
  // Dispose the image after use to prevent a memory leak.
  image.dispose();
})();
```

## GPU Acceleration

React Native Skia relies on the [OffscreenCanvas API](https://developer.mozilla.org/en-US/docs/Web/API/OffscreenCanvas) to support GPU-Accelerated offscreen surfacs.
This means, that to benefit from the GPU acceleration, you will need to provide a polyfill of the [OffscreenCanvas API](https://developer.mozilla.org/en-US/docs/Web/API/OffscreenCanvas) on Node.
Below is our own OffScreenCanvas polyfill implementation that relies on WebGL using [headless-gl](https://github.com/stackgl/headless-gl).

```tsx
// Here we use gl for headless webgl support.
import GL from "gl";

// Now we need to provide polyfill for WebGLRenderingContext and OffscreenCanvas 
// for Skia to be able to leverage WebGL
global.WebGLRenderingContext = GL.WebGLRenderingContext;
global.OffscreenCanvas = class OffscreenCanvasPolyfill
  implements OffscreenCanvas
{
  private gl: WebGLRenderingContext;
  constructor(public readonly width: number, public readonly height: number) {
    this.gl = GL(width, height, {
      preserveDrawingBuffer: true,
    });
  }
  oncontextlost: ((this: OffscreenCanvas, ev: Event) => unknown) | null;
  oncontextrestored: ((this: OffscreenCanvas, ev: Event) => unknown) | null;

  transferToImageBitmap(): ImageBitmap {
    throw new Error("Method not implemented.");
  }

  addEventListener(type: unknown, listener: unknown, options?: unknown): void {
    throw new Error("Method not implemented.");
  }

  removeEventListener(
    type: unknown,
    listener: unknown,
    options?: unknown
  ): void {
    throw new Error("Method not implemented.");
  }

  dispatchEvent(event: Event): boolean {
    throw new Error("Method not implemented.");
  }

  getContext(ctx: string) {
    if (ctx === "webgl") {
      const _getUniformLocation = this.gl.getUniformLocation;
      // Temporary fix for https://github.com/stackgl/headless-gl/issues/170
      this.gl.getUniformLocation = function (program: any, name: any) {
        if (program._uniforms && !/\[\d+\]$/.test(name)) {
          const reg = new RegExp(`${name}\\[\\d+\\]$`);
          for (let i = 0; i < program._uniforms.length; i++) {
            const _name = program._uniforms[i].name;
            if (reg.test(_name)) {
              name = _name;
            }
          }
        }
        return _getUniformLocation.call(this, program, name);
      };

      return this.gl;
    }
    return null;
  }
};
```