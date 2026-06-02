import { surface, itRunsWithGraphite } from "../setup";

// Ported from react-native-webgpu (DawnToggles.spec.ts). Exercises the
// non-standard `dawnToggles` field on GPUDeviceDescriptor, which chains Dawn's
// DawnTogglesDescriptor onto the native device descriptor at requestDevice
// time. WebGPU is only available on Graphite (Dawn) builds.
describe("Dawn toggles", () => {
  itRunsWithGraphite(
    "requests a device with enabled and disabled dawnToggles",
    async () => {
      const result = await surface.eval(() => {
        return navigator.gpu.requestAdapter().then((adapter) =>
          adapter!
            .requestDevice({
              dawnToggles: {
                enabledToggles: ["disable_symbol_renaming"],
                disabledToggles: ["lazy_clear_resource_on_first_use"],
              },
            } as GPUDeviceDescriptor)
            .then((device) => !!device)
        );
      });
      expect(result).toBe(true);
    }
  );

  itRunsWithGraphite(
    "requests a device with no dawnToggles (unchanged behavior)",
    async () => {
      const result = await surface.eval(() => {
        return navigator.gpu
          .requestAdapter()
          .then((adapter) =>
            adapter!.requestDevice().then((device) => !!device)
          );
      });
      expect(result).toBe(true);
    }
  );

  itRunsWithGraphite(
    "ignores unknown toggle names without failing device creation",
    async () => {
      const result = await surface.eval(() => {
        return navigator.gpu.requestAdapter().then((adapter) =>
          adapter!
            .requestDevice({
              dawnToggles: { enabledToggles: ["this_toggle_does_not_exist"] },
            } as GPUDeviceDescriptor)
            .then((device) => !!device)
        );
      });
      expect(result).toBe(true);
    }
  );
});
