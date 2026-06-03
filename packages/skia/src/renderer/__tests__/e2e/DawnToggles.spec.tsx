import { surface, itRunsWithGraphite } from "../setup";

// Ported from react-native-webgpu (DawnToggles.spec.ts). Exercises the
// non-standard, Dawn-only `dawnToggles` device option, which is parsed in
// cpp/rnwgpu/api/descriptors/GPUDeviceDescriptor.h and chained onto the native
// wgpu::DeviceDescriptor in GPUAdapter::requestDevice. WebGPU is only available
// on Graphite (Dawn) builds, and dawnToggles is a Dawn extension, so these are
// gated on the Graphite backend.
describe("Dawn toggles", () => {
  itRunsWithGraphite(
    "requests a device with enabled and disabled dawnToggles",
    async () => {
      const result = await surface.eval(() => {
        return RNWebGPU.gpu.requestAdapter().then((adapter) =>
          adapter!
            .requestDevice({
              dawnToggles: {
                enabledToggles: ["disable_symbol_renaming"],
                disabledToggles: ["lazy_clear_resource_on_first_use"],
              },
            })
            .then((device) => !!device)
        );
      });
      expect(result).toBe(true);
    }
  );

  itRunsWithGraphite(
    "ignores unknown toggle names without failing device creation",
    async () => {
      const result = await surface.eval(() => {
        return RNWebGPU.gpu.requestAdapter().then((adapter) =>
          adapter!
            .requestDevice({
              dawnToggles: { enabledToggles: ["this_toggle_does_not_exist"] },
            })
            .then((device) => !!device)
        );
      });
      expect(result).toBe(true);
    }
  );

  // The tests above only assert that requestDevice resolves, which is true
  // whether or not the toggle is parsed and chained onto the device descriptor.
  // This test instead activates a real toggle (skip_validation) and observes a
  // behavioral difference, so it fails if dawnToggles ever stops being applied.
  itRunsWithGraphite(
    "applies skip_validation so a normally-invalid buffer creates without error",
    async () => {
      const result = await surface.eval(() => {
        // MAP_READ may only be combined with COPY_DST and MAP_WRITE only with
        // COPY_SRC, so MAP_READ | MAP_WRITE is a validation error by default.
        // The buffer is never used on the GPU, so creating it with validation
        // skipped is harmless on every backend.
        const invalid = {
          size: 16,
          usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.MAP_WRITE,
        };
        // A fresh adapter per device: an adapter only vends a single device.
        return RNWebGPU.gpu
          .requestAdapter()
          .then((adapter) => adapter!.requestDevice())
          .then((control) => {
            control.pushErrorScope("validation");
            control.createBuffer(invalid);
            return control.popErrorScope();
          })
          .then((controlError) =>
            RNWebGPU.gpu
              .requestAdapter()
              .then((adapter) =>
                adapter!.requestDevice({
                  dawnToggles: { enabledToggles: ["skip_validation"] },
                })
              )
              .then((toggled) => {
                toggled.pushErrorScope("validation");
                toggled.createBuffer(invalid);
                return toggled.popErrorScope();
              })
              .then((toggledError) => ({
                controlHadError: controlError !== null,
                toggledHadError: toggledError !== null,
              }))
          );
      });
      // The operation is genuinely invalid on this build (guards against the
      // test silently passing because the buffer became valid).
      expect(result.controlHadError).toBe(true);
      // skip_validation took effect, which is only possible if dawnToggles was
      // parsed and chained onto the device descriptor.
      expect(result.toggledHadError).toBe(false);
    }
  );
});
