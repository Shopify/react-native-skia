import type { NativeBuffer } from "./NativeBuffer";

// Skia's Graphite/Dawn backend extends the standard WebGPU API (typed by
// @webgpu/types) with a few Skia- and Dawn-specific entry points. These are
// only available on native (SK_GRAPHITE) builds, reachable through
// `Skia.getDevice()`.
//
// The exported interfaces below describe the descriptors and objects those
// entry points use; the `declare global` block augments the standard WebGPU
// interfaces so the new methods are typed without casting to `any`.

/**
 * Descriptor for {@link GPUDevice.importExternalTexture} when the source is a
 * Skia NativeBuffer (Skia has no WebCodecs `VideoFrame`).
 *
 * `source` is the handle returned by `Skia.NativeBuffer.MakeFromImage`: a
 * `CVPixelBufferRef` on Apple, an `AHardwareBuffer*` on Android. The caller
 * owns its lifetime (release it with `Skia.NativeBuffer.Release`) and must keep
 * it alive until the imported texture is destroyed.
 */
export interface SkiaGPUExternalTextureDescriptor extends GPUObjectDescriptorBase {
  source: NativeBuffer;
  /** Rotation applied while sampling, in degrees. One of 0 | 90 | 180 | 270. */
  rotation?: number;
  /** Mirror horizontally while sampling. */
  mirrored?: boolean;
}

/**
 * Descriptor for {@link GPUDevice.importSharedTextureMemory}. `handle` is the
 * NativeBuffer returned by `Skia.NativeBuffer.MakeFromImage` (see
 * {@link SkiaGPUExternalTextureDescriptor} for the platform-specific types and
 * lifetime rules).
 */
export interface GPUSharedTextureMemoryDescriptor extends GPUObjectDescriptorBase {
  handle: NativeBuffer;
}

/**
 * Shared texture memory imported from a platform native buffer via
 * {@link GPUDevice.importSharedTextureMemory}. Create a texture that aliases
 * the memory, then bracket the GPU work that touches it with
 * {@link GPUSharedTextureMemory.beginAccess} / {@link GPUSharedTextureMemory.endAccess}.
 */
export interface GPUSharedTextureMemory extends GPUObjectBase {
  /** Create a texture that aliases the shared memory. */
  createTexture(descriptor?: GPUTextureDescriptor): GPUTexture;
  /**
   * Acquire the memory for GPU access. `initialized` marks whether the existing
   * contents should be preserved (pass `true` for an already-rendered frame).
   * Returns `false` if access could not be acquired.
   */
  beginAccess(texture: GPUTexture, initialized: boolean): boolean;
  /**
   * Release the memory after the GPU work that accessed it has been submitted.
   * Returns `false` on failure.
   */
  endAccess(texture: GPUTexture): boolean;
}

/**
 * Dawn-specific toggles, passed via {@link GPUDeviceDescriptor.dawnToggles} to
 * `adapter.requestDevice`. This is a non-spec, Dawn-only extension; see Dawn's
 * toggle list for valid names.
 */
export interface GPUDawnTogglesDescriptor {
  enabledToggles?: string[];
  disabledToggles?: string[];
}

declare global {
  interface GPUDeviceDescriptor {
    /** Dawn-specific toggles (Skia/Graphite extension, non-spec). */
    dawnToggles?: GPUDawnTogglesDescriptor;
  }

  interface GPUExternalTexture {
    /**
     * Skia extension: end the imported buffer's shared-memory access window and
     * release the underlying resources. Call right after the `queue.submit()`
     * that sampled this texture (never before). Idempotent, and also runs at
     * garbage collection as a fallback.
     */
    destroy(): void;
  }

  interface GPUDevice {
    /**
     * Skia extension: import a NativeBuffer (from
     * `Skia.NativeBuffer.MakeFromImage`) as a {@link GPUExternalTexture}, sampled
     * with `texture_external` in WGSL. The returned texture owns the
     * shared-memory access window; call `destroy()` on it after the sampling
     * `queue.submit()`.
     */
    importExternalTexture(
      descriptor: SkiaGPUExternalTextureDescriptor
    ): GPUExternalTexture;
    /**
     * Skia extension: import a NativeBuffer (from
     * `Skia.NativeBuffer.MakeFromImage`) as {@link GPUSharedTextureMemory}, the
     * lower-level path that lets you create an aliasing texture and manage the
     * begin/end access window yourself.
     */
    importSharedTextureMemory(
      descriptor: GPUSharedTextureMemoryDescriptor
    ): GPUSharedTextureMemory;
  }
}
