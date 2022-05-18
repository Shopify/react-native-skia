import { RNSkDerivedValue } from "../RNSkDerivedValue";
import { RNSkValue } from "../RNSkValue";

describe("RNSkDerivedValue", () => {
  it("should update when dependency changes", () => {
    const dependency = new RNSkValue(10);
    const derived = new RNSkDerivedValue(
      () => 10 * dependency.current,
      [dependency]
    );
    expect(derived.current).toBe(100);
    dependency.current = 20;
    expect(derived.current).toBe(200);
  });
});
