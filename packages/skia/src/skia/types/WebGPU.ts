import type { NativeBuffer } from "./NativeBuffer";

/**
 * Make the WebGPU flag constants (`GPUBufferUsage`, `GPUColorWrite`,
 * `GPUMapMode`, `GPUShaderStage`, `GPUTextureUsage`) available on the runtime
 * that calls this.
 *
 * The native module installs these globals on the main JS runtime, but worklet
 * runtimes (Reanimated UI, dedicated worklet runtimes, Vision Camera frame
 * processors) start without them, so referencing the bare global inside a
 * worklet yields `undefined`. Call `installWebGPU()` once at the top of a
 * worklet to install them there:
 *
 * ```tsx
 * import { installWebGPU } from "@shopify/react-native-skia";
 *
 * const work = (device: GPUDevice) => {
 *   "worklet";
 *   installWebGPU();
 *   device.createBuffer({
 *     usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
 *   });
 * };
 * ```
 *
 * `installWebGPU` is a native host function. When captured into a worklet, the
 * Worklets serializer re-creates it on the worklet runtime, so calling it there
 * installs the constants on that runtime. The values come from the native
 * `wgpu::*Usage` enums, so they stay a single source of truth across runtimes.
 * Calling it on a runtime that already has the constants is a safe no-op, and on
 * web (where the constants are always global) it is a no-op too.
 */
export const installWebGPU: () => void = (() => {
  const g =
    typeof global !== "undefined"
      ? (global as unknown as { installWebGPU?: () => void })
      : undefined;
  return g && typeof g.installWebGPU === "function"
    ? g.installWebGPU
    : () => {};
})();

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
 * The kind of native synchronization primitive a {@link GPUSharedFence} wraps,
 * matching the `shared-fence-*` device feature names. Limited to the kinds
 * react-native-skia targets (iOS/Metal and Android/Vulkan); `importSharedFence`
 * accepts these and `export()` reports them.
 */
export type GPUSharedFenceType =
  | "mtl-shared-event"
  | "sync-fd"
  | "vk-semaphore-opaque-fd";

/**
 * Descriptor for {@link GPUDevice.importSharedFence}.
 */
export interface GPUSharedFenceDescriptor {
  /**
   * The fence kind to import. Must match a `shared-fence-*` feature enabled on
   * the device.
   */
  type: GPUSharedFenceType;
  /**
   * The raw native handle as a BigInt: an `id<MTLSharedEvent>` pointer for
   * `"mtl-shared-event"`, or an OS file descriptor for the `*-fd` kinds.
   */
  handle: bigint;
  label?: string;
}

export interface GPUSharedFenceExportInfo {
  type: GPUSharedFenceType;
  /**
   * An `id<MTLSharedEvent>` pointer (Apple) or file descriptor (Android), as a
   * BigInt. The caller takes ownership; e.g. an exported sync-fd must be closed
   * once consumed.
   */
  handle: bigint;
}

/**
 * A native GPU synchronization primitive shared across queues/APIs. Produced by
 * {@link GPUSharedTextureMemory.endAccess}, consumed by
 * {@link GPUSharedTextureMemory.beginAccess}, or imported from a consumer's
 * fence with {@link GPUDevice.importSharedFence}.
 */
export interface GPUSharedFence {
  readonly __brand: "GPUSharedFence";
  label: string;
  export(): GPUSharedFenceExportInfo;
}

/** A fence and the timeline value to wait for (0n for binary sync-fd fences). */
export interface GPUSharedFenceState {
  fence: GPUSharedFence;
  signaledValue: bigint;
}

/**
 * The result of {@link GPUSharedTextureMemory.endAccess}: each fence is signaled
 * at its `signaledValue` once Dawn's GPU work for the access completes.
 */
export interface GPUSharedTextureMemoryEndAccessState {
  initialized: boolean;
  fences: GPUSharedFenceState[];
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
   * Optional `fences` are wait fences: Dawn waits for each to reach its
   * `signaledValue` before writing the surface. Throws if the access could not
   * be acquired.
   */
  beginAccess(
    texture: GPUTexture,
    initialized: boolean,
    fences?: GPUSharedFenceState[]
  ): void;
  /**
   * Release the memory after the GPU work that accessed it has been submitted,
   * and return the fences Dawn produced for the access. Throws on failure.
   */
  endAccess(texture: GPUTexture): GPUSharedTextureMemoryEndAccessState;
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
    /**
     * Skia extension: import a native synchronization primitive (an
     * `id<MTLSharedEvent>` on Apple, a sync-fd / VkSemaphore on Android) as a
     * {@link GPUSharedFence}, e.g. to wait on a fence a consumer produced. The
     * matching `shared-fence-*` feature must be enabled on the device.
     */
    importSharedFence(descriptor: GPUSharedFenceDescriptor): GPUSharedFence;
  }
}
