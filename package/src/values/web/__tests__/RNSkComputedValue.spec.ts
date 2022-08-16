import { RNSkComputedValue } from "../RNSkComputedValue";
import { RNSkValue } from "../RNSkValue";

describe("RNSkComputedValue", () => {
  it("should update when dependency changes", () => {
    const dependency = new RNSkValue(10);
    const computed = new RNSkComputedValue(
      () => 10 * dependency.current,
      [dependency]
    );
    expect(computed.current).toBe(100);
    dependency.current = 20;
    expect(computed.current).toBe(200);
  });
});
