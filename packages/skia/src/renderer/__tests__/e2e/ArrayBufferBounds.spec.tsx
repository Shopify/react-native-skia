import { surface, itRunsWithGraphite } from "../setup";

// These tests exercise the conversion of JS BufferSources (TypedArrays /
// DataView / raw ArrayBuffer) into the native rnwgpu::ArrayBuffer in
// cpp/rnwgpu/ArrayBuffer.h.
//
// The native `fromJSI` reads `byteOffset` / `byteLength` / `BYTES_PER_ELEMENT`
// directly off the JS object and does `arrayBuffer.data(runtime) + byteOffset`
// with `byteLength` as the size. Those properties must be validated against the
// real size of the backing ArrayBuffer: a spoofed object (or a view over a
// detached / resized buffer) can otherwise produce an out-of-bounds pointer or
// length and trigger a heap OOB read/write when consumed by writeBuffer.
//
// Dawn's node binding avoids this because it reads ByteOffset()/ByteLength()
// from the engine's typed-array view object (Napi), whose invariants the JS
// engine guarantees. Since JSI exposes these only as user-readable properties,
// we must validate them ourselves: byteOffset + byteLength <= buffer size.
//
// WebGPU is only available on Graphite (Dawn) builds, so these are gated on
// the Graphite backend.
describe("ArrayBuffer bounds", () => {
  // -- Correctness of the legitimate offset path -------------------------------

  itRunsWithGraphite(
    "writes a typed-array view that has a non-zero byteOffset",
    async () => {
      const result = await surface.eval((Skia) => {
        const device = Skia.getDevice();
        // A Float32Array view starting at element 1 of a 4-element buffer.
        const backing = new Float32Array([10, 20, 30, 40]);
        const view = backing.subarray(1, 3); // [20, 30], byteOffset = 4
        const size = view.byteLength; // 8 bytes

        const src = device.createBuffer({
          size,
          usage: GPUBufferUsage.COPY_SRC | GPUBufferUsage.COPY_DST,
        });
        const readBuffer = device.createBuffer({
          size,
          usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
        });

        device.queue.writeBuffer(src, 0, view);
        const encoder = device.createCommandEncoder();
        encoder.copyBufferToBuffer(src, 0, readBuffer, 0, size);
        device.queue.submit([encoder.finish()]);
        return device.queue
          .onSubmittedWorkDone()
          .then(() =>
            readBuffer
              .mapAsync(GPUMapMode.READ)
              .then(() =>
                Array.from(new Float32Array(readBuffer.getMappedRange()))
              )
          );
      });
      // Must read the SLICE, not the whole backing buffer.
      expect(result).toEqual([20, 30]);
    }
  );

  itRunsWithGraphite(
    "respects dataOffset/size element arguments of writeBuffer",
    async () => {
      const result = await surface.eval((Skia) => {
        const device = Skia.getDevice();
        const data = new Uint32Array([1, 2, 3, 4]);
        const size = 2 * data.BYTES_PER_ELEMENT; // copy elements [1,2]

        const src = device.createBuffer({
          size,
          usage: GPUBufferUsage.COPY_SRC | GPUBufferUsage.COPY_DST,
        });
        const readBuffer = device.createBuffer({
          size,
          usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
        });

        // dataOffset = 1 element, size = 2 elements -> [2, 3]
        device.queue.writeBuffer(src, 0, data, 1, 2);
        const encoder = device.createCommandEncoder();
        encoder.copyBufferToBuffer(src, 0, readBuffer, 0, size);
        device.queue.submit([encoder.finish()]);
        return device.queue
          .onSubmittedWorkDone()
          .then(() =>
            readBuffer
              .mapAsync(GPUMapMode.READ)
              .then(() =>
                Array.from(new Uint32Array(readBuffer.getMappedRange()))
              )
          );
      });
      expect(result).toEqual([2, 3]);
    }
  );

  itRunsWithGraphite(
    "accepts a raw ArrayBuffer as the data source",
    async () => {
      const result = await surface.eval((Skia) => {
        const device = Skia.getDevice();
        const ab = new Uint8Array([5, 6, 7, 8]).buffer; // raw ArrayBuffer
        const size = ab.byteLength;

        const src = device.createBuffer({
          size,
          usage: GPUBufferUsage.COPY_SRC | GPUBufferUsage.COPY_DST,
        });
        const readBuffer = device.createBuffer({
          size,
          usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
        });

        device.queue.writeBuffer(src, 0, ab);
        const encoder = device.createCommandEncoder();
        encoder.copyBufferToBuffer(src, 0, readBuffer, 0, size);
        device.queue.submit([encoder.finish()]);
        return device.queue
          .onSubmittedWorkDone()
          .then(() =>
            readBuffer
              .mapAsync(GPUMapMode.READ)
              .then(() =>
                Array.from(new Uint8Array(readBuffer.getMappedRange()))
              )
          );
      });
      expect(result).toEqual([5, 6, 7, 8]);
    }
  );

  // -- Out-of-bounds rejection -------------------------------------------------
  // The following cases MUST throw rather than read/write out of bounds. They
  // pass once fromJSI validates byteOffset + byteLength against the real buffer
  // size. Without that fix they may corrupt memory / crash instead of throwing.

  itRunsWithGraphite(
    "rejects a spoofed BufferSource whose byteLength exceeds the buffer",
    async () => {
      await expect(
        surface.eval((Skia) => {
          const device = Skia.getDevice();
          const realBuffer = new ArrayBuffer(4);
          // Looks like a TypedArray to native code, but lies about its size.
          const spoofed = {
            buffer: realBuffer,
            byteOffset: 0,
            byteLength: 1 << 24, // 16 MB, far beyond the 4-byte backing store
            BYTES_PER_ELEMENT: 1,
          };
          const dst = device.createBuffer({
            size: 256,
            usage: GPUBufferUsage.COPY_DST,
          });
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          device.queue.writeBuffer(dst, 0, spoofed as any);
          return true;
        })
      ).rejects.toBeDefined();
    }
  );

  itRunsWithGraphite(
    "rejects a spoofed BufferSource whose byteOffset is past the end",
    async () => {
      await expect(
        surface.eval((Skia) => {
          const device = Skia.getDevice();
          const realBuffer = new ArrayBuffer(4);
          const spoofed = {
            buffer: realBuffer,
            byteOffset: 1 << 24,
            byteLength: 4,
            BYTES_PER_ELEMENT: 1,
          };
          const dst = device.createBuffer({
            size: 256,
            usage: GPUBufferUsage.COPY_DST,
          });
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          device.queue.writeBuffer(dst, 0, spoofed as any);
          return true;
        })
      ).rejects.toBeDefined();
    }
  );

  itRunsWithGraphite(
    "rejects a BufferSource with a negative byteOffset",
    async () => {
      await expect(
        surface.eval((Skia) => {
          const device = Skia.getDevice();
          const realBuffer = new ArrayBuffer(16);
          const spoofed = {
            buffer: realBuffer,
            byteOffset: -8, // wraps to a huge size_t in native code
            byteLength: 8,
            BYTES_PER_ELEMENT: 1,
          };
          const dst = device.createBuffer({
            size: 256,
            usage: GPUBufferUsage.COPY_DST,
          });
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          device.queue.writeBuffer(dst, 0, spoofed as any);
          return true;
        })
      ).rejects.toBeDefined();
    }
  );
});
