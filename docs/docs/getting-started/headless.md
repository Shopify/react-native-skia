---
id: headless
title: Headless
sidebar_label: Headless
slug: /getting-started/headless
---

You can also run React Native Skia on Node.

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
})();
```

To benefit from the GPU acceleration, you can provide a polyfill of the [OffscreenCanvas API](https://developer.mozilla.org/en-US/docs/Web/API/OffscreenCanvas) that supports WebGL.

```tsx
// Here we use gl for headless webgl support.
import GL from "gl";

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
      // Temporary fix https://github.com/stackgl/headless-gl/issues/170
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