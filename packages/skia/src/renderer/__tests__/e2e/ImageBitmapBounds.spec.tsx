import { surface, itRunsWithGraphite } from "../setup";

// These tests exercise the same BufferSource bounds checking as
// ArrayBufferBounds.spec.tsx, but through the non-standard createImageBitmap
// overload that accepts an ArrayBuffer / TypedArray of encoded image bytes.
//
// That path must reuse the shared rnwgpu::ArrayBuffer converter
// (cpp/rnwgpu/ArrayBuffer.h), so a spoofed BufferSource that lies about
// byteOffset / byteLength is rejected rather than producing an out-of-bounds
// read when the bytes are copied.
//
// NOTE: createImageBitmap is a native-only (non-standard) binding. It is not
// bound in Skia's runtime yet, so each test self-skips (with a warning) until
// the binding is installed in RNSkManager. Once createImageBitmap is exposed,
// these run automatically on Graphite builds. They are skipped on web (the
// overload is native-only) via the Graphite gate.

// Returns true when the connected device exposes a createImageBitmap binding.
// Until the native binding lands these specs are inert rather than vacuously
// passing (any rejection — including "createImageBitmap is not defined" —
// would otherwise satisfy `.rejects`).
const isCreateImageBitmapBound = () =>
  surface.eval(() => typeof createImageBitmap === "function");

describe("createImageBitmap bounds", () => {
  itRunsWithGraphite(
    "rejects a spoofed BufferSource whose byteLength exceeds the buffer",
    async () => {
      if (!(await isCreateImageBitmapBound())) {
        console.warn("createImageBitmap is not bound — skipping");
        return;
      }
      await expect(
        surface.eval(() => {
          const realBuffer = new ArrayBuffer(4);
          const spoofed = {
            buffer: realBuffer,
            byteOffset: 0,
            byteLength: 1 << 24, // 16 MB, far beyond the 4-byte backing store
            BYTES_PER_ELEMENT: 1,
          };
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          return createImageBitmap(spoofed as any).then(() => true);
        })
      ).rejects.toBeDefined();
    }
  );

  itRunsWithGraphite(
    "rejects a spoofed BufferSource whose byteOffset is past the end",
    async () => {
      if (!(await isCreateImageBitmapBound())) {
        console.warn("createImageBitmap is not bound — skipping");
        return;
      }
      await expect(
        surface.eval(() => {
          const realBuffer = new ArrayBuffer(4);
          const spoofed = {
            buffer: realBuffer,
            byteOffset: 1 << 24,
            byteLength: 4,
            BYTES_PER_ELEMENT: 1,
          };
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          return createImageBitmap(spoofed as any).then(() => true);
        })
      ).rejects.toBeDefined();
    }
  );

  itRunsWithGraphite(
    "rejects a BufferSource with a negative byteOffset",
    async () => {
      if (!(await isCreateImageBitmapBound())) {
        console.warn("createImageBitmap is not bound — skipping");
        return;
      }
      await expect(
        surface.eval(() => {
          const realBuffer = new ArrayBuffer(16);
          const spoofed = {
            buffer: realBuffer,
            byteOffset: -8, // wraps to a huge size_t in native code
            byteLength: 8,
            BYTES_PER_ELEMENT: 1,
          };
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          return createImageBitmap(spoofed as any).then(() => true);
        })
      ).rejects.toBeDefined();
    }
  );
});
