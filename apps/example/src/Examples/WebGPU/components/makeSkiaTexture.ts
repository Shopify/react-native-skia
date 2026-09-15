import * as THREE from "three";
import { adoptTexture } from "react-native-webgpu";
import type { SkCanvas } from "@shopify/react-native-skia";
import { Skia } from "@shopify/react-native-skia";

export interface SkiaTexture {
  texture: THREE.ExternalTexture;
  destroy: () => void;
}

// Draws with Skia into an offscreen surface and exposes the result as a
// three.js texture, without leaving the GPU: the snapshot is exported as a
// WGPUTexture (Skia.Image.MakeNativeTextureFromImage), adopted by
// react-native-webgpu and wrapped in a THREE.ExternalTexture.
// The renderer sampling it must run on Skia's Graphite device
// (importDevice(Skia.getNativeDevice())). Requires a Graphite build.
export const makeSkiaTexture = (
  width: number,
  height: number,
  draw: (canvas: SkCanvas) => void
): SkiaTexture => {
  const surface = Skia.Surface.MakeOffscreen(width, height);
  if (!surface) {
    throw new Error("makeSkiaTexture: failed to create the offscreen surface");
  }
  draw(surface.getCanvas());
  surface.flush();
  const image = surface.makeImageSnapshot();
  const gpuTexture = adoptTexture(Skia.Image.MakeNativeTextureFromImage(image));
  // The texture now owns a copy of the pixels; the Skia objects can go.
  image.dispose();
  surface.dispose();

  const texture = new THREE.ExternalTexture(gpuTexture);
  // The pixels are sRGB encoded in a non-sRGB texture format, which three's
  // WebGPU backend does not decode on its own: sample it with
  // texture(t).colorSpaceToWorking(THREE.SRGBColorSpace) in a node material.
  texture.colorSpace = THREE.SRGBColorSpace;
  return {
    texture,
    destroy: () => {
      texture.dispose();
      gpuTexture.destroy();
    },
  };
};
